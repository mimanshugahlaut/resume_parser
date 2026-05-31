"""
Master resume parsing orchestrator.
Coordinates file reading, regex, spaCy, and Gemini extraction into one pipeline.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from ..models.schemas import AIExtraction, Education, Experience, ParsedResume
from .ai_parser import extract_from_resume
from .docx_reader import extract_text_from_docx
from .nlp_parser import extract_name
from .pdf_reader import extract_text_from_pdf
from .regex_parser import extract_email, extract_linkedin, extract_phone, extract_github

logger = logging.getLogger(__name__)

# Supported file types
SUPPORTED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def _get_extension(filename: str) -> str:
    """Return the lowercase file extension including the dot."""
    parts = filename.rsplit(".", 1)
    if len(parts) == 2:
        return "." + parts[1].lower()
    return ""


async def parse_resume(
    file_bytes: bytes,
    filename: str,
    nlp_model: Optional[Any],
) -> ParsedResume:
    """
    Full resume parsing pipeline:
    1. Validate file type and size
    2. Extract raw text (PDF or DOCX)
    3. Run regex extraction (email, phone, LinkedIn)
    4. Run spaCy NER (name fallback)
    5. Run Gemini Flash AI extraction (name, skills, summary, education, experience)
    6. Merge all results into a ParsedResume

    Args:
        file_bytes: Raw bytes of the uploaded file.
        filename: Original filename (used to detect type).
        nlp_model: Pre-loaded spaCy language model (or None if unavailable).

    Returns:
        A fully populated ParsedResume object with a unique UUID.

    Raises:
        ValueError: For unsupported file type or oversized file.
        RuntimeError: If text extraction or AI parsing fails.
    """
    # -----------------------------------------------------------------------
    # Step 0: Validate
    # -----------------------------------------------------------------------
    ext = _get_extension(filename)
    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file type '{ext}'. Please upload a PDF or DOCX file."
        )

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(
            f"File too large ({len(file_bytes) / 1024 / 1024:.1f} MB). "
            "Maximum allowed size is 5 MB."
        )

    logger.info("Starting parse pipeline for '%s' (%d bytes).", filename, len(file_bytes))

    # -----------------------------------------------------------------------
    # Step 1: Extract raw text
    # -----------------------------------------------------------------------
    if ext == ".pdf":
        raw_text = extract_text_from_pdf(file_bytes)
    else:
        raw_text = extract_text_from_docx(file_bytes)

    # -----------------------------------------------------------------------
    # Step 2: Regex extraction (fast, always runs)
    # -----------------------------------------------------------------------
    email = extract_email(raw_text)
    phone = extract_phone(raw_text)
    linkedin = extract_linkedin(raw_text)
    github = extract_github(raw_text)

    # -----------------------------------------------------------------------
    # Step 3: spaCy NER (name extraction fallback)
    # -----------------------------------------------------------------------
    spacy_name: Optional[str] = None
    if nlp_model is not None:
        try:
            doc = nlp_model(raw_text[:2000])  # Only analyse the first 2000 chars (top of resume)
            spacy_name = extract_name(doc)
        except Exception as exc:
            logger.warning("spaCy extraction failed: %s", exc)

    # -----------------------------------------------------------------------
    # Step 4: Gemini Flash AI extraction (primary extraction engine)
    # -----------------------------------------------------------------------
    try:
        ai_data = await extract_from_resume(raw_text)
    except (EnvironmentError, RuntimeError) as exc:
        logger.warning("AI extraction unavailable; using local parser fallback: %s", exc)
        ai_data = _extract_locally(raw_text)

    # -----------------------------------------------------------------------
    # Step 5: Merge results (AI takes priority; spaCy fills name gaps)
    # -----------------------------------------------------------------------
    # Name: prefer Gemini result; fall back to spaCy; last resort = "Unknown"
    name = (ai_data.name.strip() or spacy_name or "Unknown").strip()

    parsed = ParsedResume(
        id=str(uuid.uuid4()),
        name=name,
        email=email,
        phone=phone,
        linkedin=linkedin,
        github=github,
        education=ai_data.education,
        experience=ai_data.experience,
        skills=ai_data.skills,
        summary=ai_data.summary,
        parsed_at=datetime.now(timezone.utc),
        filename=filename,
    )

    logger.info(
        "Parse pipeline complete for '%s'. Name: '%s', Skills: %d, "
        "Education: %d, Experience: %d.",
        filename,
        parsed.name,
        len(parsed.skills),
        len(parsed.education),
        len(parsed.experience),
    )
    return parsed


def _extract_locally(raw_text: str) -> AIExtraction:
    """Best-effort extraction used when Gemini is not configured or unavailable."""
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    name = _guess_name(lines)

    return AIExtraction(
        name=name,
        skills=_extract_skills(raw_text),
        summary=_build_summary(lines, name),
        education=_extract_education_entries(lines),
        experience=_extract_experience_entries(
            lines,
            {"experience", "employment", "work history", "projects", "internship"},
        ),
    )


def _guess_name(lines: list[str]) -> str:
    for line in lines[:8]:
        lower = line.lower()
        if "@" in line or "linkedin" in lower or "github" in lower:
            continue
        words = [word.strip(".,|") for word in line.split()]
        if 2 <= len(words) <= 5 and all(word[:1].isalpha() for word in words):
            return " ".join(words)
    return ""


def _extract_skills(raw_text: str) -> list[str]:
    known_skills = [
        "python", "java", "javascript", "typescript", "react", "node.js", "node",
        "express", "fastapi", "django", "flask", "sql", "mysql", "postgresql",
        "mongodb", "aws", "azure", "gcp", "docker", "kubernetes", "git", "html",
        "css", "tailwind", "bootstrap", "machine learning", "deep learning",
        "nlp", "data analysis", "pandas", "numpy", "excel", "power bi", "tableau",
        "leadership", "communication", "problem solving", "agile", "scrum",
    ]
    lower_text = raw_text.lower()
    found = []
    for skill in known_skills:
        if skill in lower_text:
            label = "Node.js" if skill == "node" else skill
            found.append(label.upper() if label in {"sql", "aws", "gcp", "nlp"} else label.title())
    return sorted(set(found))


def _build_summary(lines: list[str], name: str) -> str:
    if not lines:
        return ""
    useful_lines = [
        line for line in lines
        if line != name and "@" not in line and "linkedin" not in line.lower()
    ]
    first_line = useful_lines[0] if useful_lines else lines[0]
    return first_line[:240]


def _extract_education_entries(lines: list[str]) -> list[Education]:
    entries: list[Education] = []
    for line in _collect_section_lines(lines, {"education", "academic", "qualification"}):
        entries.append(Education(degree=line, institution="", year=""))
    return entries


def _extract_experience_entries(lines: list[str], headings: set[str]) -> list[Experience]:
    entries: list[Experience] = []
    for line in _collect_section_lines(lines, headings):
        entries.append(Experience(title=line, company="", duration=""))
    return entries


def _collect_section_lines(lines: list[str], headings: set[str]) -> list[str]:
    entries: list[str] = []
    in_section = False
    stop_headings = {
        "summary", "profile", "skills", "education", "academic", "qualification",
        "experience", "employment", "work history", "projects", "internship",
        "certifications", "achievements",
    }

    for line in lines:
        normalized = line.strip().lower().rstrip(":")
        if normalized in headings:
            in_section = True
            continue
        if in_section and normalized in stop_headings and normalized not in headings:
            break
        if in_section and len(entries) < 5:
            entries.append(line)

    return entries
