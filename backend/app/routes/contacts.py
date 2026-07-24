

import smtplib
import time
from collections import defaultdict, deque
from email.message import EmailMessage
from typing import Deque, Dict, Optional

import httpx
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    Query,
    Request,
    status,
)
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.database import get_db
from app.models.contact_submissions import ContactSubmission
from app.models.user import User
from app.schemas.contacts import ContactCreate, ContactListResponse, ContactRead

router = APIRouter(prefix="/contacts", tags=["Contact"])

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

MIN_FILL_MS = 3000  # is se tez submit insaan ka kaam nahi

# NOTE: chatbot me bhi aisa hi rate limiter hai. Dono per-process hain —
# multiple workers par har worker ka apna counter hoga.
RATE_LIMIT_SUBMISSIONS = 5
RATE_LIMIT_WINDOW = 60 * 60

_hits: Dict[str, Deque[float]] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _check_rate_limit(ip: str) -> None:
    now = time.time()
    bucket = _hits[ip]

    while bucket and now - bucket[0] > RATE_LIMIT_WINDOW:
        bucket.popleft()

    if len(bucket) >= RATE_LIMIT_SUBMISSIONS:
        raise HTTPException(
            status_code=429,
            detail="You've sent several messages already. Please try again later.",
        )
    bucket.append(now)


async def _verify_turnstile(token: str, ip: str) -> bool:
    """Turnstile configured na ho to True — form bina captcha ke chalta rahe."""
    secret = settings.TURNSTILE_SECRET_KEY
    if not secret:
        return True
    if not token:
        return False

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                TURNSTILE_VERIFY_URL,
                data={"secret": secret, "response": token, "remoteip": ip},
            )
            return bool(response.json().get("success"))
    except Exception as exc:  # noqa: BLE001
        # Cloudflare down ho to asli visitors ko na roken
        print(f"[contacts] Turnstile verify failed: {exc}")
        return True


def _notify_team(submission_id: int, name: str, email: str, phone: str,
                 subjects: str, message: str, source_page: str) -> None:
    """SMTP configured ho to team ko email. BackgroundTasks me chalta hai."""
    to_address = settings.CONTACT_NOTIFY_EMAIL
    if not to_address or not settings.SMTP_HOST:
        return

    try:
        mail = EmailMessage()
        mail["Subject"] = f"New contact form submission: {name}"
        mail["From"] = settings.SMTP_FROM_EMAIL
        mail["To"] = to_address
        mail["Reply-To"] = email  # seedha reply kar sakein
        mail.set_content(
            f"Name:     {name}\n"
            f"Email:    {email}\n"
            f"Phone:    {phone or '-'}\n"
            f"Services: {subjects or '-'}\n\n"
            f"Message:\n{message}\n\n"
            f"Page:     {source_page or '-'}\n"
            f"ID:       {submission_id}\n"
        )

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(mail)

    except Exception as exc:  # noqa: BLE001
        # Email fail ho to submission phir bhi DB me mehfooz hai
        print(f"[contacts] notification email failed: {exc}")


# ---------------------------------------------------------------- public


@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_contact(
    body: ContactCreate,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    ip = _client_ip(request)

    # Bot ko batana nahi ke pakre gaye — warna wo tareeqa badal lete hain.
    # Is liye success hi return karte hain, bas save kuch nahi hota.
    if body.website.strip():
        print(f"[contacts] honeypot triggered from {ip}")
        return {"ok": True}

    if 0 < body.elapsed_ms < MIN_FILL_MS:
        print(f"[contacts] submitted too fast ({body.elapsed_ms}ms) from {ip}")
        return {"ok": True}

    if not await _verify_turnstile(body.turnstile_token, ip):
        raise HTTPException(
            status_code=400,
            detail="Verification failed. Please refresh the page and try again.",
        )

    _check_rate_limit(ip)

    submission = ContactSubmission(
        first_name=body.first_name,
        last_name=body.last_name,
        email=body.email,
        phone_code=body.phone_code,
        phone=body.phone,
        has_website=body.has_website,
        subjects=body.subjects,
        message=body.message,
        source_page=body.source_page,
        user_agent=request.headers.get("user-agent", "")[:500],
        ip_address=ip,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    background.add_task(
        _notify_team,
        submission.id,
        submission.full_name,
        body.email,
        f"{body.phone_code} {body.phone}".strip(),
        ", ".join(body.subjects),
        body.message,
        body.source_page,
    )

    return {"ok": True, "id": submission.id}


# ---------------------------------------------------------------- admin


@router.get("", response_model=ContactListResponse)
def list_contacts(
    db: Session = Depends(get_db),
    search: str = Query("", description="Name, email ya message me search"),
    unread_only: bool = Query(False),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    filters = []
    if unread_only:
        filters.append(ContactSubmission.is_read.is_(False))
    if search.strip():
        needle = f"%{search.strip()}%"
        filters.append(
            or_(
                ContactSubmission.first_name.ilike(needle),
                ContactSubmission.last_name.ilike(needle),
                ContactSubmission.email.ilike(needle),
                ContactSubmission.message.ilike(needle),
            )
        )

    total = db.query(func.count(ContactSubmission.id)).filter(*filters).scalar() or 0
    unread = (
        db.query(func.count(ContactSubmission.id))
        .filter(ContactSubmission.is_read.is_(False))
        .scalar()
        or 0
    )

    items = (
        db.query(ContactSubmission)
        .filter(*filters)
        .order_by(ContactSubmission.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return {
        "items": items,
        "total": total,
        "unread": unread,
        "page": page,
        "per_page": per_page,
    }


@router.get("/{contact_id}", response_model=ContactRead)
def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    submission = db.get(ContactSubmission, contact_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


@router.patch("/{contact_id}/read", response_model=ContactRead)
def toggle_read(
    contact_id: int,
    is_read: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    submission = db.get(ContactSubmission, contact_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission.is_read = is_read
    db.commit()
    db.refresh(submission)
    return submission


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    submission = db.get(ContactSubmission, contact_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    db.delete(submission)
    db.commit()
    return None