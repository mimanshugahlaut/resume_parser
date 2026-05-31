"""
Master resume parsing orchestrator.
Coordinates file reading, regex, spaCy, and Gemini extraction into one pipeline.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

import spacy

from ..models.schemas import ParsedResume
from .ai_parser import extract_from_resume
from .docx_reader import extract_text_from_docx
from .nlp_parser import extract_name
from .pdf_reader import extract_text_from_pdf
from .regex_parser import extract_email, extract_linkedin, extract_phone

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
    nlp_model: Optional[spacy.language.Language],
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
    ai_data = await extract_from_resume(raw_text)

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
