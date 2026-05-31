"""
/resumes endpoints — list and retrieve parsed resumes from in-memory store.
"""

import logging

from fastapi import APIRouter, HTTPException, Request, status

from ..models.schemas import ParsedResume

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.get(
    "",
    response_model=list[ParsedResume],
    summary="List all parsed resumes",
    description="Returns a list of all resumes parsed in this session (in-memory).",
)
async def list_resumes(request: Request) -> list[ParsedResume]:
    """Return all resumes stored in the current session."""
    resumes: dict = getattr(request.app.state, "resumes", {})
    return list(resumes.values())


@router.get(
    "/{resume_id}",
    response_model=ParsedResume,
    summary="Get a specific parsed resume",
    description="Returns a single parsed resume by its UUID.",
)
async def get_resume(resume_id: str, request: Request) -> ParsedResume:
    """Return a single resume by UUID."""
    resumes: dict = getattr(request.app.state, "resumes", {})
    resume = resumes.get(resume_id)
    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume '{resume_id}' not found.",
        )
    return resume


@router.delete(
    "/{resume_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a parsed resume",
    description="Removes a resume from the in-memory session store.",
)
async def delete_resume(resume_id: str, request: Request) -> None:
    """Delete a resume by UUID."""
    resumes: dict = getattr(request.app.state, "resumes", {})
    if resume_id not in resumes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume '{resume_id}' not found.",
        )
    del resumes[resume_id]
    logger.info("Deleted resume %s from session store.", resume_id)
