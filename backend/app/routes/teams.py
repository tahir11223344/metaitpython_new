import os
import shutil
import uuid
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy import or_
from sqlalchemy.orm import Session

# --- adjust these two imports to match your project ---
from app.database import get_db
from app.core.deps import get_current_user
# ------------------------------------------------------

from app.models.teams import Team
from app.models.user import User
from app.schemas.teams import TeamListResponse, TeamResponse

router = APIRouter(prefix="/teams", tags=["Teams"])

UPLOAD_DIR = "uploads/teams"
ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"}


def _save_upload(file: UploadFile) -> str:
    """File ko disk pe save karke uska relative URL path return karta hai."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_IMAGE_EXT:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, name)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return f"/{UPLOAD_DIR}/{name}"


def _delete_file(stored_path: str) -> None:
    """
    DB path (e.g. "/uploads/teams/abc.jpg") ki file disk se delete karta hai.
    Safety: sirf 'uploads/' ke andar wali files, aur error pe crash nahi.
    """
    if not stored_path:
        return
    rel = stored_path.lstrip("/")
    upload_root = os.path.abspath("uploads")
    target = os.path.abspath(rel)
    if not target.startswith(upload_root + os.sep):
        return
    try:
        if os.path.isfile(target):
            os.remove(target)
    except OSError:
        pass


@router.get("", response_model=TeamListResponse)
def list_teams(
    search: Optional[str] = Query(None, description="Search in name/designation/email"),
    is_active: Optional[bool] = Query(None),
    sort_by: str = Query("sort_order", pattern="^(sort_order|created_at|updated_at)$"),
    sort_dir: str = Query("asc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user),
):
    query = db.query(Team)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Team.name.ilike(term),
                Team.designation.ilike(term),
                Team.email.ilike(term),
            )
        )

    if is_active is not None:
        query = query.filter(Team.is_active == is_active)

    total = query.count()

    column = {
        "sort_order": Team.sort_order,
        "created_at": Team.created_at,
        "updated_at": Team.updated_at,
    }[sort_by]
    order = column.asc() if sort_dir == "asc" else column.desc()

    # sort_order barabar ho to naye pehle
    items = (
        query.order_by(order, Team.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    return {"items": items, "total": total, "page": page, "size": size}


@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(
    name: str = Form(...),
    designation: str = Form(...),
    sort_order: int = Form(0),
    is_active: bool = Form(True),
    email: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    image_alt: Optional[str] = Form(None),
    facebook_url: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    instagram_url: Optional[str] = Form(None),
    twitter_url: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    profile_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    image_path = None
    if profile_image and profile_image.filename:
        image_path = _save_upload(profile_image)

    team = Team(
        name=name.strip(),
        designation=designation.strip(),
        sort_order=sort_order,
        is_active=is_active,
        email=(email or None),
        phone=(phone or None),
        profile_image=image_path,
        image_alt=(image_alt or None),
        facebook_url=(facebook_url or None),
        linkedin_url=(linkedin_url or None),
        instagram_url=(instagram_url or None),
        twitter_url=(twitter_url or None),
        bio=(bio or None),
    )
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


@router.get("/{team_id}", response_model=TeamResponse)
def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team member not found")
    return team


@router.put("/{team_id}", response_model=TeamResponse)
def update_team(
    team_id: int,
    name: Optional[str] = Form(None),
    designation: Optional[str] = Form(None),
    sort_order: Optional[int] = Form(None),
    is_active: Optional[bool] = Form(None),
    email: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    image_alt: Optional[str] = Form(None),
    facebook_url: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    instagram_url: Optional[str] = Form(None),
    twitter_url: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    profile_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team member not found")

    if name is not None:
        team.name = name.strip()
    if designation is not None:
        team.designation = designation.strip()
    if sort_order is not None:
        team.sort_order = sort_order
    if is_active is not None:
        team.is_active = is_active
    if email is not None:
        team.email = email or None
    if phone is not None:
        team.phone = phone or None
    if image_alt is not None:
        team.image_alt = image_alt or None
    if facebook_url is not None:
        team.facebook_url = facebook_url or None
    if linkedin_url is not None:
        team.linkedin_url = linkedin_url or None
    if instagram_url is not None:
        team.instagram_url = instagram_url or None
    if twitter_url is not None:
        team.twitter_url = twitter_url or None
    if bio is not None:
        team.bio = bio or None

    # Nayi image di gayi to replace (purani commit ke BAAD delete)
    old_image = None
    if profile_image and profile_image.filename:
        old_image = team.profile_image
        team.profile_image = _save_upload(profile_image)

    db.commit()
    db.refresh(team)

    if old_image:
        _delete_file(old_image)

    return team


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team member not found")

    image_path = team.profile_image

    db.delete(team)
    db.commit()

    # DB record delete hone ke baad image bhi disk se delete
    if image_path:
        _delete_file(image_path)

    return None