# ZATCA Bridge backend — container image for Railway / Render / Fly.io.
#
# Unlike Vercel's serverless Python runtime, a container lets us install the
# two system binaries this backend shells out to:
#   * a JRE  — app/services/zatca_validator.py runs `java -jar cli-3.0.8…jar`
#   * tesseract — pytesseract OCR for scanned-PDF invoice parsing
FROM python:3.12-slim

# System deps:
#   default-jre-headless → Java runtime for the ZATCA SDK validator JAR
#   tesseract-ocr        → OCR engine used by pytesseract
#   libgomp1             → runtime lib pandas/numpy wheels need
# Kept minimal; all Python packages here ship manylinux wheels (no compiler).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        default-jre-headless \
        tesseract-ocr \
        libgomp1 \
        curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first so the layer caches across code changes.
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the application (the 21 MB ZATCA JAR is committed and comes along).
COPY . .

RUN chmod +x ./start.sh

# Railway/Render inject $PORT; default to 8000 for local `docker run`.
ENV PORT=8000
EXPOSE 8000

CMD ["./start.sh"]
