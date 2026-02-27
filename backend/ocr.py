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
            # EasyOCR limits certain language pairings in a single reader. We use "en" here.
            _reader = easyocr.Reader(['en'], gpu=False, verbose=False)
            logger.info("EasyOCR reader initialized with en")
        except Exception as e:
            logger.error(f"EasyOCR init failed: {e}")
            _reader = False  # Mark as failed so we don't retry
    return _reader


def extract_text(image_bytes: bytes) -> str:
    """
    Extract text from image bytes.
    Falls back to a placeholder if OCR is unavailable.
    """
    # Primary: try pytesseract first for seamless multilingual text extraction.
    try:
        import pytesseract
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(image_bytes))
        # Add support for English, Hindi, Tamil, Telugu
        text = pytesseract.image_to_string(img, lang="eng+hin+tam+tel", config="--psm 6").strip()
        if text:
            logger.info("Tesseract extracted text successfully.")
            return text
    except Exception as e:
        logger.warning(f"Tesseract extraction failed: {e}. Trying EasyOCR fallback.")
    # Fallback: try EasyOCR (English only as fallback context)
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
                logger.info("EasyOCR fallback successful.")
                return text
        except Exception as e:
            logger.warning(f"EasyOCR fallback error: {e}")

    # Last resort: return empty string — Groq will analyse with no text context
    logger.warning("All OCR methods failed; returning empty string")
    return ""
