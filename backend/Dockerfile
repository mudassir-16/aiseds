FROM python:3.10-slim

# Non-interactive apt installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies (Tesseract, language packs, OpenCV libs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-hin \
    tesseract-ocr-tam \
    tesseract-ocr-tel \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements file first (for caching)
COPY requirements.txt .

# Install CPU variant of PyTorch first to save disk space & memory on Render
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install the rest of the python requirements
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the backend code
COPY . .

# Render exposes the 'PORT' environment variable for web services
ENV PORT=8000
EXPOSE 8000

# Start Uvicorn, mapping to 0.0.0.0 so the container is accessible externally
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
