import os
import shutil
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

# --- adjust to match your project ---
from app.core.deps import get_current_user
from app.models.user import User
# ------------------------------------

# NOTE: prefix "/media" hai taake main.py ke StaticFiles mount ("/uploads") se
# conflict na ho. Files "uploads/..." mein jati hain, jo /uploads se serve hoti hain.
router = APIRouter(prefix="/media", tags=["Media"])

IMAGE_DIR = "uploads/editor"
FILE_DIR = "uploads/files"

ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"}
ALLOWED_FILE_EXT = {
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".csv",
    ".zip",
}


def _save(file: UploadFile, folder: str, allowed: set) -> dict:
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext or 'unknown'}. "
            f"Allowed: {', '.join(sorted(allowed))}",
        )

    os.makedirs(folder, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(folder, stored_name)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "url": f"/{folder}/{stored_name}",
        "name": file.filename,  # original naam (UI mein dikhane ke liye)
        "size": os.path.getsize(path),
    }


@router.post("/image")
def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Image save karke uska URL return karta hai: {"url", "name", "size"}"""
    return _save(file, IMAGE_DIR, ALLOWED_IMAGE_EXT)


@router.post("/file")
def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Document (PDF/DOC/XLS waghera) save karke uska URL return karta hai."""
    return _save(file, FILE_DIR, ALLOWED_FILE_EXT)