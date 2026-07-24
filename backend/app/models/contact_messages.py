"""
Contact Us page ka form.

Services page wale form se alag hai — wahan subjects aur has_website hain,
yahan company details aur consent. Dono alag tables me rehte hain.
"""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from app.database import Base  # <-- adjust if your Base lives elsewhere


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String(120), nullable=False)
    last_name = Column(String(120), nullable=True, default="")

    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(40), nullable=True, default="")

    company_name = Column(String(255), nullable=True, default="")
    company_url = Column(String(500), nullable=True, default="")

    message = Column(Text, nullable=False)

    # Terms/privacy consent — sirf UI ki baat nahi, record rakhna zaroori hai
    consent = Column(Boolean, nullable=False, default=False)

    source_page = Column(String(500), nullable=True, default="")
    user_agent = Column(String(500), nullable=True, default="")
    ip_address = Column(String(64), nullable=True, default="")

    is_read = Column(Boolean, nullable=False, default=False, index=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name or ''}".strip()

    def __repr__(self) -> str:  # pragma: no cover
        return f"<ContactMessage id={self.id} email={self.email!r}>"