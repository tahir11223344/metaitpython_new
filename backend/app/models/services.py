"""
Service model.

Nested data (section_one, section_two, faqs) JSON columns me store hota hai.
Ye MySQL 5.7+, Postgres aur SQLite teeno par kaam karta hai.

NOTE: `Base` ka import path apne project ke mutabiq adjust karein.
      Agar aap ke paas `app/db/base.py` hai to wahan se import karein.
"""

from datetime import datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base  # <-- adjust if your Base lives elsewhere


def empty_section_one() -> dict:
    return {"heading": "", "image": None, "image_alt": "", "points": []}


def empty_section_two() -> dict:
    return {
        "heading": "",
        "description": "",
        "image": None,
        "image_alt": "",
        "points": [],
    }


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)

    # --- basic ---
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    short_description = Column(Text, nullable=True, default="")

    thumbnail = Column(String(500), nullable=True)  # e.g. /uploads/services/ab12.webp
    thumbnail_alt = Column(String(255), nullable=True, default="")

    is_active = Column(Boolean, nullable=False, default=True, index=True)
    sort_order = Column(Integer, nullable=False, default=0, index=True)

    # --- engaging content ---
    # {heading, image, image_alt, points: [{title, sub_title}]}
    section_one = Column(JSON, nullable=False, default=empty_section_one)
    # {heading, description, image, image_alt, points: [{title, sub_title}]}
    section_two = Column(JSON, nullable=False, default=empty_section_two)

    # --- faqs ---  [{question, answer}]
    faqs = Column(JSON, nullable=False, default=list)

    # --- seo ---
    meta_title = Column(String(255), nullable=True, default="")
    meta_keyword = Column(String(500), nullable=True, default="")
    meta_description = Column(Text, nullable=True, default="")

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # --- relations ---
    # Service delete hone par uski sub-services bhi chali jati hain
    sub_services = relationship(
        "SubService",
        back_populates="service",
        cascade="all, delete-orphan",
        order_by="SubService.sort_order",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Service id={self.id} slug={self.slug!r}>"

    # ------------------------------------------------------------------
    # Saari image paths ek list me — delete karte waqt cleanup ke liye
    # ------------------------------------------------------------------
    def media_paths(self) -> list[str]:
        paths = [self.thumbnail]
        for section in (self.section_one, self.section_two):
            if isinstance(section, dict):
                paths.append(section.get("image"))
        return [p for p in paths if p]