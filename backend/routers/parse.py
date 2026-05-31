"""
/parse endpoint — accepts a resume file (PDF or DOCX) and returns structured JSON.
"""

import logging

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status

from models.schemas import ParsedResume
from services.extractor import parse_resume

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/parse", tags=["Parse"])


@router.post(
    "",
    response_model=ParsedResume,
    summary="Parse a resume",
    description=(
        "Upload a PDF or DOCX resume. "
        "Returns structured JSON with name, contact info, education, experience, and skills."
    ),
)
async def parse_resume_endpoint(
    request: Request,
    file: UploadFile = File(..., description="Resume file (PDF or DOCX, max 5 MB)"),
) -> ParsedResume:
    """
    Parse an uploaded resume file and return structured data.

    - Accepts: multipart/form-data with a single file field named `file`
    - Returns: ParsedResume JSON object
    - Stores result in-memory for use by the /match endpoint
    """
    # Read file bytes
    file_bytes = await file.read()

    try:
        # Run the full parsing pipeline
        nlp_model = getattr(request.app.state, "nlp_model", None)
        result = await parse_resume(
            file_bytes=file_bytes,
            filename=file.filename or "resume",
            nlp_model=nlp_model,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except RuntimeError as exc:
        logger.error("Parse pipeline error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Parsing failed: {exc}",
        )

    # Store in-memory (app.state.resumes dict keyed by UUID)
    if not hasattr(request.app.state, "resumes"):
        request.app.state.resumes = {}
    request.app.state.resumes[result.id] = result

    logger.info("Stored parsed resume '%s' with ID %s.", result.filename, result.id)
    return result
