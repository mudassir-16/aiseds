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


# Lifespan not needed for pytesseract


app = FastAPI(
    title="SEDS — AI Social Engineering Defense System",
    description="AI-powered financial fraud prevention backend",
    version="1.0.0",
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
