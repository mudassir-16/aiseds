"""
ocr.py — Text extraction from images using EasyOCR with keyword fallback.
"""
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Lazy-loaded EasyOCR reader
_reader = None


def _get_reader():
    global _reader
    if _reader is None:
        try:
            import easyocr
            _reader = easyocr.Reader(['en'], gpu=False, verbose=False)
            logger.info("EasyOCR reader initialized")
        except Exception as e:
            logger.error(f"EasyOCR init failed: {e}")
            _reader = False  # Mark as failed so we don't retry
    return _reader


def extract_text(image_bytes: bytes) -> str:
    """
    Extract text from image bytes.
    Falls back to a placeholder if OCR is unavailable.
    """
    reader = _get_reader()

    if reader and reader is not False:
        try:
            import numpy as np
            from PIL import Image
            import io

            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            img_np = np.array(img)
            results = reader.readtext(img_np, detail=0)
            text = " ".join(results).strip()
            if text:
                logger.info(f"OCR extracted {len(text)} characters")
                return text
        except Exception as e:
            logger.warning(f"OCR extraction error: {e}")

    # Fallback: try pytesseract
    try:
        import pytesseract
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(img).strip()
        if text:
            logger.info("Pytesseract fallback successful")
            return text
    except Exception as e:
        logger.warning(f"Pytesseract fallback failed: {e}")

    # Last resort: return empty string — Groq will analyse with no text context
    logger.warning("All OCR methods failed; returning empty string")
    return ""
