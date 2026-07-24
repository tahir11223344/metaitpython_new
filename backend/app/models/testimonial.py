import uuid

from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Testimonial(Base):
    """
    Client testimonial shown on the marketing site.
    """

    __tablename__ = "testimonials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    rating = Column(Integer, nullable=False)  # 1..5
    is_active = Column(Boolean, nullable=False, default=True)

    # Optional highlight stat, e.g. percentage "95%" + title "Client Satisfaction"
    highlight_percentage = Column(String(50), nullable=True)
    highlight_title = Column(String(255), nullable=True)

    short_description = Column(Text, nullable=False)

    # Foreign Keys ko UUID se badal kar Integer kar diya gaya hai
    created_by_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    updated_by_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    created_by = relationship("User", foreign_keys=[created_by_id], lazy="joined")
    updated_by = relationship("User", foreign_keys=[updated_by_id], lazy="joined")