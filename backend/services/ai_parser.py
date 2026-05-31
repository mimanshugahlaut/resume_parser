"""
Gemini Flash AI extraction service.
Uses google-genai SDK with native structured JSON output (Pydantic schema enforcement).
Handles resume parsing AND job description match scoring.
"""

import asyncio
import logging
import os
from typing import Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types

from models.schemas import AIExtraction, AIMatchExtraction

load_dotenv()

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Gemini client initialisation (module-level singleton)
# ---------------------------------------------------------------------------

_client: Optional[genai.Client] = None


def get_gemini_client() -> genai.Client:
    """Return a cached Gemini client, creating it on first call."""
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise EnvironmentError(
                "GEMINI_API_KEY is not set. "
                "Copy backend/.env.example to backend/.env and add your key."
            )
        _client = genai.Client(api_key=api_key)
        logger.info("Gemini client initialised with model gemini-2.5-flash.")
    return _client


# ---------------------------------------------------------------------------
# Resume extraction prompt
# ---------------------------------------------------------------------------

_PARSE_PROMPT = """\
You are an expert resume parser. Given the following resume text, extract all information accurately.

Extract:
1. The candidate's full name
2. All technical and soft skills (be comprehensive — include programming languages, frameworks, tools, methodologies, and soft skills)
3. A 2-sentence professional summary highlighting their key strengths and experience
4. All education entries (degree, institution, year/date range)
5. All work experience entries (job title, company name, duration)

Be thorough. If a field is not present, use an empty string or empty list.
Do NOT invent information that is not in the resume.

Resume Text:
---
{resume_text}
---
"""

# ---------------------------------------------------------------------------
# Match scoring prompt
# ---------------------------------------------------------------------------

_MATCH_PROMPT = """\
You are an expert technical recruiter. Compare the candidate's skills against the job description and score the match.

Candidate Skills: {candidate_skills}

Job Description:
---
{job_description}
---

Provide:
1. A match score from 0 to 100 (100 = perfect match)
2. Skills from the job description that the candidate already has
3. Important skills from the job description that the candidate is missing
4. A short 1-2 sentence recommendation for the hiring manager

Be realistic and objective in your scoring.
"""


# ---------------------------------------------------------------------------
# Main extraction function
# ---------------------------------------------------------------------------

async def extract_from_resume(resume_text: str) -> AIExtraction:
    """
    Use Gemini Flash to extract structured data from resume text.

    Args:
        resume_text: Raw text extracted from the resume file.

    Returns:
        AIExtraction Pydantic model with all parsed fields.

    Raises:
        RuntimeError: If Gemini fails after retries.
    """
    client = get_gemini_client()
    prompt = _PARSE_PROMPT.format(resume_text=resume_text[:8000])  # Limit to 8k chars

    max_retries = 2
    last_error: Optional[Exception] = None

    for attempt in range(1, max_retries + 1):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AIExtraction,
                    temperature=0.1,  # Low temperature for factual extraction
                ),
            )
            result: AIExtraction = response.parsed
            logger.info(
                "Gemini extraction succeeded (attempt %d). Skills found: %d",
                attempt,
                len(result.skills),
            )
            return result

        except Exception as exc:
            last_error = exc
            logger.warning("Gemini attempt %d failed: %s", attempt, exc)
            if attempt < max_retries:
                await asyncio.sleep(2**attempt)  # Exponential backoff

    raise RuntimeError(
        f"Gemini Flash extraction failed after {max_retries} attempts: {last_error}"
    )


async def score_job_match(
    candidate_skills: list[str],
    job_description: str,
) -> AIMatchExtraction:
    """
    Use Gemini Flash to score how well a candidate's skills match a job description.

    Args:
        candidate_skills: List of skills from the parsed resume.
        job_description: The full job description text.

    Returns:
        AIMatchExtraction with score, matched/missing skills, and recommendation.
    """
    client = get_gemini_client()
    skills_str = ", ".join(candidate_skills) if candidate_skills else "None listed"
    prompt = _MATCH_PROMPT.format(
        candidate_skills=skills_str,
        job_description=job_description[:4000],
    )

    max_retries = 2
    last_error: Optional[Exception] = None

    for attempt in range(1, max_retries + 1):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AIMatchExtraction,
                    temperature=0.1,
                ),
            )
            result: AIMatchExtraction = response.parsed
            logger.info(
                "Gemini match scoring succeeded. Score: %d%%", result.match_score
            )
            return result

        except Exception as exc:
            last_error = exc
            logger.warning("Gemini match attempt %d failed: %s", attempt, exc)
            if attempt < max_retries:
                await asyncio.sleep(2**attempt)

    raise RuntimeError(
        f"Gemini Flash match scoring failed after {max_retries} attempts: {last_error}"
    )
