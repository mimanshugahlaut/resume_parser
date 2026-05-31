"""
/match endpoint — scores a parsed resume against a job description.
"""

import logging

from fastapi import APIRouter, HTTPException, Request, status

from models.schemas import MatchRequest, MatchResult
from services.ai_parser import score_job_match

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/match", tags=["Match"])


@router.post(
    "",
    response_model=MatchResult,
    summary="Score resume vs job description",
    description=(
        "Given a previously parsed resume ID and a job description, "
        "returns a match score (0–100), matched skills, and missing skills."
    ),
)
async def match_resume_endpoint(
    body: MatchRequest,
    request: Request,
) -> MatchResult:
    """
    Match a parsed resume against a job description.

    - Requires a resume_id from a prior /parse call
    - Accepts the full job description as a string
    - Returns match score, matched/missing skills, and a recruiter recommendation
    """
    # Retrieve resume from in-memory store
    resumes: dict = getattr(request.app.state, "resumes", {})
    resume = resumes.get(body.resume_id)

    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID '{body.resume_id}' not found. Please upload and parse first.",
        )

    if not body.job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Job description cannot be empty.",
        )

    try:
        ai_match = await score_job_match(
            candidate_skills=resume.skills,
            job_description=body.job_description,
        )
    except RuntimeError as exc:
        logger.error("Match scoring error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Match scoring failed: {exc}",
        )

    return MatchResult(
        match_score=ai_match.match_score,
        matched_skills=ai_match.matched_skills,
        missing_skills=ai_match.missing_skills,
        recommendation=ai_match.recommendation,
    )
