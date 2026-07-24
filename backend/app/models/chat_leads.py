"""
Chat lead model.

Chatbot ke darmiyan visitor apna naam/email de to wo yahan mehfooz hota hai.
"""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from app.database import Base  # <-- adjust if your Base lives elsewhere


class ChatLead(Base):
    __tablename__ = "chat_leads"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(64), nullable=True, default="")

    # Bot ne jo samjha: visitor kis cheez me dilchaspi rakhta hai
    interest = Column(String(255), nullable=True, default="")
    summary = Column(Text, nullable=True, default="")

    # Kis page se aaya aur kaunsa browser — follow-up me kaam aata hai
    source_page = Column(String(500), nullable=True, default="")
    user_agent = Column(String(500), nullable=True, default="")
    ip_address = Column(String(64), nullable=True, default="")

    is_read = Column(Boolean, nullable=False, default=False, index=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<ChatLead id={self.id} email={self.email!r}>"