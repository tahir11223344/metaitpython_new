from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Brand(Base):
  

    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    company_name = Column(String(200), nullable=False)
    website = Column(String(500), nullable=True)

    logo = Column(String(500), nullable=True)
    logo_alt = Column(String(255), nullable=True)

    sort_order = Column(Integer, nullable=False, default=0, index=True)
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )