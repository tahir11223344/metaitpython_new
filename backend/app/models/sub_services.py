"""
SubService model.

Har sub-service ek hi service ke neeche aati hai (one-to-many).
URL: /services/{service.slug}/{sub_service.slug}

Slug ek service ke andar unique hai, poori site me nahi — yani "web-development"
do alag services ke neeche reh sakta hai. Nested URL ki wajah se ye theek hai.
"""

from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base  # <-- adjust if your Base lives elsewhere


def empty_hero() -> dict:
    return {"heading": "", "short_description": ""}


def empty_campaign() -> dict:
    return {"title": "", "points": []}


def empty_process() -> dict:
    return {"title": "", "steps": []}


def empty_commitments() -> dict:
    return {"title": "", "description": "", "points": []}


def empty_why_choose() -> dict:
    return {"title": "", "points": []}


class SubService(Base):
    __tablename__ = "sub_services"

    id = Column(Integer, primary_key=True, index=True)

    service_id = Column(
        Integer,
        ForeignKey("services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # --- basic ---
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, index=True)
    short_description = Column(Text, nullable=True, default="")

    icon = Column(String(500), nullable=True)  # /uploads/sub-services/ab12.webp

    is_active = Column(Boolean, nullable=False, default=True, index=True)
    show_on_services_page = Column(Boolean, nullable=False, default=False, index=True)
    show_on_landing_page = Column(Boolean, nullable=False, default=False, index=True)
    sort_order = Column(Integer, nullable=False, default=0, index=True)

    # Service detail page ke card par jo bullets dikhte hain — ["point", ...]
    main_points = Column(JSON, nullable=False, default=list)

    # --- page content ---
    # {heading, short_description}
    hero_section = Column(JSON, nullable=False, default=empty_hero)
    # {title, points: ["..."]}
    campaign_section = Column(JSON, nullable=False, default=empty_campaign)
    # {title, steps: [{title, description}]}
    development_process = Column(JSON, nullable=False, default=empty_process)
    # {title, description, points: [{image, title, sub_title}]}
    commitments_section = Column(JSON, nullable=False, default=empty_commitments)
    # {title, points: [{strong_text, description}]}
    why_choose_section = Column(JSON, nullable=False, default=empty_why_choose)

    # [{question, answer}]
    faqs = Column(JSON, nullable=False, default=list)

    # --- seo ---
    meta_title = Column(String(255), nullable=True, default="")
    meta_keyword = Column(String(500), nullable=True, default="")
    meta_description = Column(Text, nullable=True, default="")

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    service = relationship("Service", back_populates="sub_services")

    __table_args__ = (
        UniqueConstraint("service_id", "slug", name="uq_sub_service_slug_per_service"),
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<SubService id={self.id} slug={self.slug!r} service_id={self.service_id}>"

    def media_paths(self) -> list[str]:
        """Saari image paths — delete par cleanup ke liye."""
        paths = [self.icon]
        commitments = self.commitments_section or {}
        for point in commitments.get("points") or []:
            if isinstance(point, dict):
                paths.append(point.get("image"))
        return [p for p in paths if p]