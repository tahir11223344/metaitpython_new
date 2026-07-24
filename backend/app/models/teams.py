from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Team(Base):
 
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    name = Column(String(150), nullable=False)
    designation = Column(String(150), nullable=False)

    sort_order = Column(Integer, nullable=False, default=0, index=True)
    is_active = Column(Boolean, nullable=False, default=True)

    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)

    profile_image = Column(String(500), nullable=True)
    image_alt = Column(String(255), nullable=True)

    facebook_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    instagram_url = Column(String(500), nullable=True)
    twitter_url = Column(String(500), nullable=True)

    bio = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )