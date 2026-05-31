"""
PDF text extraction using pdfplumber.
Handles multi-page PDFs, tables, and basic multi-column layouts.
"""

import io
import logging

import pdfplumber

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract all text from a PDF file given as raw bytes.

    Args:
        file_bytes: Raw bytes of the uploaded PDF file.

    Returns:
        Cleaned, concatenated text from all pages.

    Raises:
        ValueError: If the PDF has no extractable text (likely a scanned image PDF).
    """
    text_parts: list[str] = []

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            # Extract text; pdfplumber returns None for image-only pages
            page_text = page.extract_text(x_tolerance=3, y_tolerance=3)

            if page_text:
                text_parts.append(page_text.strip())
            else:
                # Try extracting words if full text extraction fails
                words = page.extract_words()
                if words:
                    word_text = " ".join(w["text"] for w in words)
                    text_parts.append(word_text.strip())
                else:
                    logger.warning(
                        "Page %d of PDF has no extractable text — may be a scanned image.",
                        page_num,
                    )

    full_text = "\n\n".join(text_parts).strip()

    if not full_text:
        raise ValueError(
            "No text could be extracted from this PDF. "
            "It may be a scanned image. Please provide a text-based PDF."
        )

    logger.info("Extracted %d characters from PDF (%d pages).", len(full_text), len(text_parts))
    return full_text
