"""Contact form submissions."""

from datetime import datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, Integer, String, Text

from app.database import Base  # <-- adjust if your Base lives elsewhere


class ContactSubmission(Base):
    __tablename__ = "contact_submissions"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String(120), nullable=False)
    last_name = Column(String(120), nullable=True, default="")

    email = Column(String(255), nullable=False, index=True)
    phone_code = Column(String(8), nullable=True, default="")
    phone = Column(String(40), nullable=True, default="")

    # Yes/No/khali — is liye nullable
    has_website = Column(Boolean, nullable=True)

    # ["Digital Marketing", "Cloud & DevOps", ...]
    subjects = Column(JSON, nullable=False, default=list)

    message = Column(Text, nullable=False)

    # Follow-up ke liye context
    source_page = Column(String(500), nullable=True, default="")
    user_agent = Column(String(500), nullable=True, default="")
    ip_address = Column(String(64), nullable=True, default="")

    is_read = Column(Boolean, nullable=False, default=False, index=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name or ''}".strip()

    def __repr__(self) -> str:  # pragma: no cover
        return f"<ContactSubmission id={self.id} email={self.email!r}>"