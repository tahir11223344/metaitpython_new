# ==========================================================================
# Backend (FastAPI) — D:\newmetait\backend me rakhein, naam: Dockerfile
# ==========================================================================

FROM python:3.12-slim

# PYTHONUNBUFFERED: print/logs foran dikhein (buffer me na atkein)
# PYTHONDONTWRITEBYTECODE: .pyc files na banein (container me bekar hain)
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Pehle sirf requirements copy karte hain — is se Docker ka layer cache kaam
# karta hai. Jab tak requirements.txt na badle, pip install dobara nahi chalta.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Ab poora backend code
COPY . .

# uploads folder — yahan files aati hain. compose me ise volume banayenge
# taake container restart par files na khoyein.
RUN mkdir -p uploads

EXPOSE 8000

# --host 0.0.0.0 ZAROORI hai. 127.0.0.1 sirf container ke andar sunta hai,
# bahar se koi reach nahi kar sakta. 0.0.0.0 sab interfaces par sunta hai.
# --reload production me nahi (wo dev ke liye hai).
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
