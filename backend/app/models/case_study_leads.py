"""
Case study download leads.

Visitor case study download karne se pehle apni details deta hai (gated
download). Wo details yahan mehfooz hoti hain, aur file download ho jati hai.
"""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base  # <-- adjust if your Base lives elsewhere


class CaseStudyLead(Base):
    __tablename__ = "case_study_leads"

    id = Column(Integer, primary_key=True, index=True)

    # Kaunsi case study download hui. SET NULL taake case study delete hone par
    # lead ka record na khoye (kis cheez me dilchaspi thi, wo title me reh jata).
    case_study_id = Column(
        Integer,
        ForeignKey("case_studies.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    case_study_title = Column(String(255), nullable=True, default="")

    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(40), nullable=True, default="")
    location = Column(String(255), nullable=True, default="")

    source_page = Column(String(500), nullable=True, default="")
    user_agent = Column(String(500), nullable=True, default="")
    ip_address = Column(String(64), nullable=True, default="")

    is_read = Column(Boolean, nullable=False, default=False, index=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<CaseStudyLead id={self.id} email={self.email!r}>"