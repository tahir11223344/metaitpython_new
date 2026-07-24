from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    JSON,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Portfolio(Base):
    """
    Portfolio / case-study entry.

    - category_id -> categories.id (INTEGER FK; aapki Category table bhi integer id
      thi, isliye match hai).
    - description: rich-text HTML (editor se aata hai).
    - thumbnail: single image ka path (e.g. "/uploads/portfolios/abc.jpg").
    - gallery_images: image paths ki JSON list. "Gallery Images" count = is list ki length.
    - No user FK (UI mein Created By/Updated By nahi tha).
    """

    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    category_id = Column(
        Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )

    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    subtitle = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)  # HTML

    thumbnail = Column(String(500), nullable=True)  # path
    gallery_images = Column(JSON, nullable=False, default=list)  # list[str] paths
    image_alt = Column(String(255), nullable=True)

    is_active = Column(Boolean, nullable=False, default=True)
    show_on_landing = Column(Boolean, nullable=False, default=False)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    category = relationship("Category", lazy="joined")