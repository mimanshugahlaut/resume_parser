"""
spaCy NER-based extraction.
Used primarily for name extraction as a complement to Gemini Flash AI extraction.
The model is loaded once at app startup and passed in to avoid re-loading per request.
"""

import logging
from typing import Optional

import spacy

logger = logging.getLogger(__name__)


def extract_name(doc: spacy.tokens.Doc) -> Optional[str]:
    """
    Extract the candidate's full name using spaCy's PERSON entity.

    Strategy:
    1. Find all PERSON entities in the document.
    2. Return the first one found in the first 50 lines (name is usually at the top).
    3. Filter out names that are too long (likely not a name) or too short.

    Args:
        doc: A spaCy Doc object (pre-processed text).

    Returns:
        The candidate's name, or None if not found.
    """
    # Only scan the first portion of text (names appear at the top)
    # We'll use the first 500 characters of the document
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text.strip()
            # Filter: names are usually 2–5 words, 4–50 characters
            if 4 <= len(name) <= 50 and len(name.split()) >= 2:
                logger.debug("spaCy extracted name: %s", name)
                return name

    logger.debug("spaCy could not find a PERSON entity for name extraction.")
    return None


def extract_organizations(doc: spacy.tokens.Doc) -> list[str]:
    """
    Extract all organisation names from the document.
    Useful for enriching experience data.
    """
    orgs = []
    seen = set()
    for ent in doc.ents:
        if ent.label_ == "ORG":
            org = ent.text.strip()
            if org.lower() not in seen and len(org) > 1:
                orgs.append(org)
                seen.add(org.lower())
    return orgs


def extract_dates(doc: spacy.tokens.Doc) -> list[str]:
    """
    Extract all date expressions from the document.
    Useful for validating experience durations.
    """
    dates = []
    seen = set()
    for ent in doc.ents:
        if ent.label_ == "DATE":
            date = ent.text.strip()
            if date.lower() not in seen:
                dates.append(date)
                seen.add(date.lower())
    return dates
