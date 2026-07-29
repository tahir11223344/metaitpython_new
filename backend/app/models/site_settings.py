"""
Site settings — poore site ki ek hi (singleton) row.

Baqi CMS collections (services, case studies) me kai rows hoti hain. Site
settings hamesha ek hi hoti hai, is liye `id=1` fix rakhte hain aur wahi
update karte rehte hain — nayi row kabhi nahi banti.

image fields (logo, favicon) sirf URL strings hain; files pehle /media/image
pe upload hoti hain (case studies jaisa pattern), phir yahan URL save hota hai.
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.database import Base  # <-- adjust if your Base lives elsewhere


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)

    # --- General ---
    site_name = Column(String(255), nullable=True, default="")
    logo = Column(String(500), nullable=True, default="")
    favicon = Column(String(500), nullable=True, default="")

    # --- Contact Info ---
    phone = Column(String(64), nullable=True, default="")
    email = Column(String(255), nullable=True, default="")
    whatsapp = Column(String(64), nullable=True, default="")
    address = Column(String(500), nullable=True, default="")

    # --- Social Links ---
    facebook = Column(String(500), nullable=True, default="")
    instagram = Column(String(500), nullable=True, default="")
    twitter = Column(String(500), nullable=True, default="")
    linkedin = Column(String(500), nullable=True, default="")

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<SiteSettings id={self.id} site_name={self.site_name!r}>"