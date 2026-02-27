"""
main.py — FastAPI application entry point.

Sets KMP_DUPLICATE_LIB_OK to suppress the OMP/OpenMP conflict that EasyOCR
triggers on Windows (libiomp5md.dll clash).  This must happen before any
torch/numpy import, so we set it at the very top.
"""
import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"   # fix EasyOCR/OpenMP conflict on Windows

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-warm EasyOCR at startup so the first image request is fast."""
    import asyncio, concurrent.futures
    logger.info("Pre-warming OCR engine…")

    def _warm():
        try:
            from ocr import _get_reader
            reader = _get_reader()   # triggers model download / load
            if reader:
                # Run a tiny dummy inference to trigger PyTorch JIT compilation.
                # This means the first real image request won't pay the compile cost.
                import numpy as np
                dummy_img = np.zeros((64, 256, 3), dtype=np.uint8)
                reader.readtext(dummy_img, detail=0)
                logger.info("OCR engine fully warmed (JIT compiled).")
            else:
                logger.warning("OCR reader unavailable — will fall back at runtime.")
        except Exception as exc:
            logger.warning(f"OCR pre-warm failed (will fall back at runtime): {exc}")

    loop = asyncio.get_event_loop()
    with concurrent.futures.ThreadPoolExecutor() as pool:
        await loop.run_in_executor(pool, _warm)

    yield   # ← app runs here
    logger.info("SEDS backend shutting down.")


app = FastAPI(
    title="SEDS — AI Social Engineering Defense System",
    description="AI-powered financial fraud prevention backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
def health():
    return {"status": "ok", "service": "SEDS Backend"}
