"""
Pydantic schemas for ResumeIQ.
Defines strict data models for request/response validation and API documentation.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------

class Education(BaseModel):
    degree: str = Field(description="Degree or qualification name")
    institution: str = Field(description="Name of the educational institution")
    year: str = Field(description="Year or date range of study, e.g. '2022–2026'")


class Experience(BaseModel):
    title: str = Field(description="Job title or role")
    company: str = Field(description="Company or organisation name")
    duration: str = Field(description="Duration, e.g. 'June 2025 – July 2025'")


# ---------------------------------------------------------------------------
# Core response model
# ---------------------------------------------------------------------------

class ParsedResume(BaseModel):
    id: str = Field(description="Unique UUID for this parsed result")
    name: str = Field(description="Candidate's full name")
    email: Optional[str] = Field(default=None, description="Email address")
    phone: Optional[str] = Field(default=None, description="Phone number")
    linkedin: Optional[str] = Field(default=None, description="LinkedIn profile URL")
    education: list[Education] = Field(default_factory=list)
    experience: list[Experience] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    summary: str = Field(default="", description="AI-generated 2-sentence professional summary")
    parsed_at: datetime = Field(description="Timestamp when the resume was parsed")
    filename: str = Field(description="Original uploaded filename")


# ---------------------------------------------------------------------------
# Match request / response
# ---------------------------------------------------------------------------

class MatchRequest(BaseModel):
    resume_id: str = Field(description="UUID of a previously parsed resume")
    job_description: str = Field(
        description="Full job description text to match against the resume"
    )


class MatchResult(BaseModel):
    match_score: int = Field(ge=0, le=100, description="Match percentage (0–100)")
    matched_skills: list[str] = Field(description="Skills present in both resume and JD")
    missing_skills: list[str] = Field(description="Skills in JD that are absent in resume")
    recommendation: str = Field(description="Short AI recommendation for the candidate")


# ---------------------------------------------------------------------------
# Gemini AI intermediate model (used inside ai_parser.py)
# ---------------------------------------------------------------------------

class AIExtraction(BaseModel):
    """Schema passed to Gemini Flash for structured JSON output."""
    name: str = Field(default="", description="Full name of the candidate")
    skills: list[str] = Field(default_factory=list)
    summary: str = Field(default="", description="2-sentence professional summary")
    education: list[Education] = Field(default_factory=list)
    experience: list[Experience] = Field(default_factory=list)


class AIMatchExtraction(BaseModel):
    """Schema for Gemini match scoring output."""
    match_score: int = Field(ge=0, le=100)
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    recommendation: str = Field(default="")
