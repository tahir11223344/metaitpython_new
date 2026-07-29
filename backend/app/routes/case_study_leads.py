"""
Case study download leads (gated download).

Flow:
    1. Visitor form bharta hai
    2. POST /case-study-leads  -> lead save + team ko email
    3. Response me document_url wapas aata hai
    4. Frontend usay download kar deta hai

Download URL SERVER se wapas bhejne ka faida: frontend ko case study ki
document field ka naam guess nahi karna parta. Chahe wo `document` ho ya
`document_path` â€” mapping ka masla khatam.

âš  IMPORTANT: neeche `_case_study_document()` me field ke naam aap ke
CaseStudy model se match karne hain. Do jagah TODO likha hai.

main.py:
    from app.routes import case_study_leads
    app.include_router(case_study_leads.router)
"""

import smtplib
import time
from collections import defaultdict, deque
from email.message import EmailMessage
from typing import Deque, Dict, Optional, Tuple

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
from app.models.case_study_leads import CaseStudyLead
from app.models.user import User
from app.schemas.case_study_leads import (
    CaseStudyLeadCreate,
    CaseStudyLeadCreated,
    CaseStudyLeadListResponse,
    CaseStudyLeadRead,
)

# CaseStudy model import â€” path aap ke project ke mutabiq adjust karein
try:
    from app.models.case_studies import CaseStudy
except ImportError:  # pragma: no cover
    CaseStudy = None

router = APIRouter(prefix="/case-study-leads", tags=["Case Study Leads"])

MIN_FILL_MS = 2000

RATE_LIMIT_SUBMISSIONS = 10
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
            status_code=429, detail="Too many downloads. Please try again later."
        )
    bucket.append(now)


def _case_study_document(db: Session, case_study_id: Optional[int]) -> Tuple[str, str, str]:
    """(title, document_url, document_name) return karta hai.

    Yehi wo jagah hai jahan file ka path nikalta hai. Field ke naam aap ke
    CaseStudy model se match hone chahiyein.
    """
    if not case_study_id or CaseStudy is None:
        return "", "", ""

    cs = db.get(CaseStudy, case_study_id)
    if not cs:
        return "", "", ""

    # TODO(1): title field ka naam â€” aksar `title` hi hota hai
    title = getattr(cs, "title", "") or ""

    # TODO(2): document field ka naam. Aap ke model me jo bhi ho, yahan likhein.
    # Common naam automatically try kar lete hain:
    document = ""
    for attr in ("document", "document_path", "file", "attachment", "pdf", "document_url"):
        value = getattr(cs, attr, None)
        if value:
            document = value
            break

    name = ""
    for attr in ("document_name", "file_name", "attachment_name"):
        value = getattr(cs, attr, None)
        if value:
            name = value
            break

    # Relative path ko full URL bana dein taake frontend seedha download kar sake
    if document and not document.startswith(("http://", "https://")):
        base = settings.PUBLIC_BASE_URL or ""
        document = f"{base}{document}" if base else document

    if document and not name:
        name = document.rsplit("/", 1)[-1]  # URL se filename nikaal lein

    return title, document, name


def _notify_team(lead_id: int, name: str, email: str, phone: str,
                 location: str, case_study: str, source_page: str) -> None:
    to_address = settings.CASE_STUDY_NOTIFY_EMAIL or settings.LEAD_NOTIFY_EMAIL
    if not to_address or not settings.SMTP_HOST:
        return

    try:
        mail = EmailMessage()
        mail["Subject"] = f"Case study downloaded: {name}"
        mail["From"] = settings.SMTP_FROM_EMAIL
        mail["To"] = to_address
        mail["Reply-To"] = email
        mail.set_content(
            f"Someone downloaded a case study.\n\n"
            f"Name:       {name}\n"
            f"Email:      {email}\n"
            f"Phone:      {phone or '-'}\n"
            f"Location:   {location or '-'}\n"
            f"Case study: {case_study or '-'}\n\n"
            f"Page:       {source_page or '-'}\n"
            f"Lead ID:    {lead_id}\n"
        )
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(mail)
    except Exception as exc:  # noqa: BLE001
        print(f"[case-study-leads] email failed: {exc}")


# ---------------------------------------------------------------- public


@router.post("", response_model=CaseStudyLeadCreated, status_code=status.HTTP_201_CREATED)
def submit_lead(
    body: CaseStudyLeadCreate,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    ip = _client_ip(request)

    # Bot pakre gaye â€” success dikhayein magar kuch save na karein
    if 0 < body.elapsed_ms < MIN_FILL_MS:
        print(f"[case-study-leads] spam trap from {ip}")
        title, document, name = _case_study_document(db, body.case_study_id)
        # Bot ko document na dein bhi, to farq nahi parta â€” wo waise bhi PDF ke
        # peeche nahi hota. Lekin asli visitor jo galti se tez nikla, uska
        # download na ruke â€” is liye URL phir bhi de dete hain.
        return {"ok": True, "document_url": document, "document_name": name}

    _check_rate_limit(ip)

    title, document, name = _case_study_document(db, body.case_study_id)

    lead = CaseStudyLead(
        case_study_id=body.case_study_id,
        case_study_title=title,
        name=body.name,
        email=body.email,
        phone=body.phone,
        location=body.location,
        source_page=body.source_page,
        user_agent=request.headers.get("user-agent", "")[:500],
        ip_address=ip,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    background.add_task(
        _notify_team,
        lead.id,
        body.name,
        body.email,
        body.phone,
        body.location,
        title,
        body.source_page,
    )

    return {
        "ok": True,
        "id": lead.id,
        "document_url": document,
        "document_name": name,
    }


# ---------------------------------------------------------------- admin


@router.get("", response_model=CaseStudyLeadListResponse)
def list_leads(
    db: Session = Depends(get_db),
    search: str = Query(""),
    unread_only: bool = Query(False),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    filters = []
    if unread_only:
        filters.append(CaseStudyLead.is_read.is_(False))
    if search.strip():
        needle = f"%{search.strip()}%"
        filters.append(
            or_(
                CaseStudyLead.name.ilike(needle),
                CaseStudyLead.email.ilike(needle),
                CaseStudyLead.case_study_title.ilike(needle),
            )
        )

    total = db.query(func.count(CaseStudyLead.id)).filter(*filters).scalar() or 0
    unread = (
        db.query(func.count(CaseStudyLead.id))
        .filter(CaseStudyLead.is_read.is_(False))
        .scalar()
        or 0
    )
    items = (
        db.query(CaseStudyLead)
        .filter(*filters)
        .order_by(CaseStudyLead.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return {"items": items, "total": total, "unread": unread, "page": page, "per_page": per_page}


@router.patch("/{lead_id}/read", response_model=CaseStudyLeadRead)
def toggle_read(
    lead_id: int,
    is_read: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = db.get(CaseStudyLead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.is_read = is_read
    db.commit()
    db.refresh(lead)
    return lead


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = db.get(CaseStudyLead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()
    return None

