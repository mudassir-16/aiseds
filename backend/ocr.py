"""
ocr.py — Text extraction from images using PyTesseract.
"""
import logging
from PIL import Image
import io

logger = logging.getLogger(__name__)

def extract_text(image_bytes: bytes) -> str:
    """
    Extract text from image bytes using PyTesseract.
    """
    try:
        import pytesseract
        img = Image.open(io.BytesIO(image_bytes))
        # Add support for English, Hindi, Tamil, Telugu
        text = pytesseract.image_to_string(img, lang="eng+hin+tam+tel", config="--psm 6").strip()
        if text:
            logger.info("Tesseract extracted text successfully.")
            return text
    except Exception as e:
        logger.warning(f"Tesseract extraction failed: {e}")

    # Last resort: return empty string — Groq will analyse with no text context
    logger.warning("All OCR methods failed; returning empty string")
    return ""
