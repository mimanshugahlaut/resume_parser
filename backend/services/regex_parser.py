"""
Regex-based extraction for structured contact fields.
Extracts email, phone number, and LinkedIn profile URL from resume text.
"""

import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Compiled regex patterns
# ---------------------------------------------------------------------------

# Email: standard RFC 5322-compatible pattern
_EMAIL_RE = re.compile(
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
    re.IGNORECASE,
)

# Phone: supports international formats (+91, +1, etc.), spaces, dashes, dots
# Examples: +91-9876543210, (123) 456-7890, 9876543210, +1 800 555 0199
_PHONE_RE = re.compile(
    r"(?:\+?\d{1,3}[\s\-.]?)?"         # Optional country code
    r"(?:\(?\d{2,4}\)?[\s\-.]?)"       # Area code
    r"\d{3,4}[\s\-.]?\d{3,4}"          # Local number
    r"(?:\s?(?:ext|x|ext\.)\s?\d{1,5})?",  # Optional extension
    re.IGNORECASE,
)

# LinkedIn: matches linkedin.com/in/username patterns
_LINKEDIN_RE = re.compile(
    r"(?:https?://)?(?:www\.)?linkedin\.com/in/[\w\-]+/?",
    re.IGNORECASE,
)

# GitHub: matches github.com/username patterns (profile URLs)
_GITHUB_RE = re.compile(
    r"(?:https?://)?(?:www\.)?github\.com/[A-Za-z0-9_.\-]+/?",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Extraction functions
# ---------------------------------------------------------------------------

def extract_email(text: str) -> Optional[str]:
    """Return the first email address found in text, or None."""
    match = _EMAIL_RE.search(text)
    if match:
        email = match.group(0).lower()
        logger.debug("Extracted email: %s", email)
        return email
    return None


def extract_phone(text: str) -> Optional[str]:
    """
    Return the first phone number found in text, or None.
    Filters out numbers that are too short (< 7 digits) to be real phone numbers.
    """
    for match in _PHONE_RE.finditer(text):
        raw = match.group(0).strip()
        # Count digits only — must have at least 7
        digits = re.sub(r"\D", "", raw)
        if len(digits) >= 7:
            logger.debug("Extracted phone: %s", raw)
            return raw
    return None


def extract_linkedin(text: str) -> Optional[str]:
    """Return the first LinkedIn profile URL found in text, or None."""
    match = _LINKEDIN_RE.search(text)
    if match:
        url = match.group(0).strip().rstrip("/")
        # Normalise: ensure it starts with https://
        if not url.startswith("http"):
            url = "https://" + url
        logger.debug("Extracted LinkedIn: %s", url)
        return url
    return None


def extract_github(text: str) -> Optional[str]:
    """Return the first GitHub profile URL found in text, or None."""
    match = _GITHUB_RE.search(text)
    if match:
        url = match.group(0).strip().rstrip("/")
        if not url.startswith("http"):
            url = "https://" + url
        logger.debug("Extracted GitHub: %s", url)
        return url
    return None
