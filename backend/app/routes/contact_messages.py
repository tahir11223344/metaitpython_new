"""
Contact Us page ka form.

Services page wale form (/contacts) se bilkul alag hai â€” alag table, alag
inbox. Spam protection dono me same hai:
    1. Honeypot    â€” chhupi hui `website` field
    2. Timing      â€” 3 second se kam me submit = bot
    3. Rate limit  â€” ek IP se 1 ghante me 5 submissions
    4. Turnstile   â€” optional (TURNSTILE_SECRET_KEY set ho tabhi)

NOTE: ye teen helper (rate limit, turnstile, email) routes/contacts.py me bhi
      hain. Dono forms alag rakhne ka faisla hua tha, is liye copy hain.
      Chahein to kabhi app/utils/spam.py me shift kar dein.

Public:
    POST   /contact-messages
Admin:
    GET    /contact-messages
    PATCH  /contact-messages/{id}/read
    DELETE /contact-messages/{id}

main.py:
    from app.routes import contact_messages
    app.include_router(contact_messages.router)
"""

import smtplib
import time
from collections import defaultdict, deque
from email.message import EmailMessage
from typing import Deque, Dict

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
from app.models.contact_messages import ContactMessage
from app.models.user import User
from app.schemas.contact_messages import (
    ContactMessageCreate,
    ContactMessageListResponse,
    ContactMessageRead,
)

router = APIRouter(prefix="/contact-messages", tags=["Contact Page Form"])

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
MIN_FILL_MS = 3000

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
    """Turnstile configured na ho to True â€” form bina captcha ke chalta rahe."""
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
        print(f"[contact-messages] Turnstile verify failed: {exc}")
        return True


def _notify_team(message_id: int, name: str, email: str, phone: str,
                 company: str, body_text: str, source_page: str) -> None:
    """SMTP configured ho to team ko email. BackgroundTasks me chalta hai."""
    to_address = settings.CONTACT_NOTIFY_EMAIL
    if not to_address or not settings.SMTP_HOST:
        return

    try:
        mail = EmailMessage()
        mail["Subject"] = f"New contact page message: {name}"
        mail["From"] = settings.SMTP_FROM_EMAIL
        mail["To"] = to_address
        mail["Reply-To"] = email  # seedha reply kar sakein
        mail.set_content(
            f"Name:    {name}\n"
            f"Email:   {email}\n"
            f"Phone:   {phone or '-'}\n"
            f"Company: {company or '-'}\n\n"
            f"Message:\n{body_text}\n\n"
            f"Page:    {source_page or '-'}\n"
            f"ID:      {message_id}\n"
        )

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(mail)

    except Exception as exc:  # noqa: BLE001
        # Email fail ho to message phir bhi DB me mehfooz hai
        print(f"[contact-messages] notification email failed: {exc}")


# ---------------------------------------------------------------- public


@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_message(
    body: ContactMessageCreate,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    ip = _client_ip(request)

    # Bot ko batana nahi ke pakre gaye â€” warna wo tareeqa badal lete hain.
    # Is liye success hi return karte hain, bas save kuch nahi hota.

    if 0 < body.elapsed_ms < MIN_FILL_MS:
        print(f"[contact-messages] submitted too fast ({body.elapsed_ms}ms) from {ip}")
        return {"ok": True}

    if not await _verify_turnstile(body.turnstile_token, ip):
        raise HTTPException(
            status_code=400,
            detail="Verification failed. Please refresh the page and try again.",
        )

    _check_rate_limit(ip)

    record = ContactMessage(
        first_name=body.first_name,
        last_name=body.last_name,
        email=body.email,
        phone=body.phone,
        company_name=body.company_name,
        company_url=body.company_url,
        message=body.message,
        consent=body.consent,
        source_page=body.source_page,
        user_agent=request.headers.get("user-agent", "")[:500],
        ip_address=ip,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    background.add_task(
        _notify_team,
        record.id,
        record.full_name,
        body.email,
        body.phone,
        f"{body.company_name} {body.company_url}".strip(),
        body.message,
        body.source_page,
    )

    return {"ok": True, "id": record.id}


# ---------------------------------------------------------------- admin


@router.get("", response_model=ContactMessageListResponse)
def list_messages(
    db: Session = Depends(get_db),
    search: str = Query("", description="Name, email, company ya message me search"),
    unread_only: bool = Query(False),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    filters = []
    if unread_only:
        filters.append(ContactMessage.is_read.is_(False))
    if search.strip():
        needle = f"%{search.strip()}%"
        filters.append(
            or_(
                ContactMessage.first_name.ilike(needle),
                ContactMessage.last_name.ilike(needle),
                ContactMessage.email.ilike(needle),
                ContactMessage.company_name.ilike(needle),
                ContactMessage.message.ilike(needle),
            )
        )

    total = db.query(func.count(ContactMessage.id)).filter(*filters).scalar() or 0
    unread = (
        db.query(func.count(ContactMessage.id))
        .filter(ContactMessage.is_read.is_(False))
        .scalar()
        or 0
    )

    items = (
        db.query(ContactMessage)
        .filter(*filters)
        .order_by(ContactMessage.created_at.desc())
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


@router.patch("/{message_id}/read", response_model=ContactMessageRead)
def toggle_read(
    message_id: int,
    is_read: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.get(ContactMessage, message_id)
    if not record:
        raise HTTPException(status_code=404, detail="Message not found")

    record.is_read = is_read
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.get(ContactMessage, message_id)
    if not record:
        raise HTTPException(status_code=404, detail="Message not found")

    db.delete(record)
    db.commit()
    return None

