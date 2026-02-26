import easyocr
import numpy as np
from PIL import Image
import io

class OCRService:
    def __init__(self):
        self._reader = None

    @property
    def reader(self):
        if self._reader is None:
            # Initialize the reader with English
            # download_enabled=True is default, but we'll be explicit
            self._reader = easyocr.Reader(['en'], gpu=False) 
        return self._reader

    def extract_text(self, image_bytes: bytes) -> str:
        try:
            # Convert bytes to image
            image = Image.open(io.BytesIO(image_bytes))
            # EasyOCR expects a numpy array or a file path
            image_np = np.array(image)
            
            # Perform OCR
            results = self.reader.readtext(image_np)
            
            # Combine results into a single string
            extracted_text = " ".join([text for (bbox, text, prob) in results])
            return extracted_text.strip()
        except Exception as e:
            print(f"OCR Error: {e}")
            return ""

ocr_service = OCRService()
