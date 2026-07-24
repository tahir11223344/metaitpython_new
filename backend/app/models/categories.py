from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Category(Base):
    """
    Content category.

    - id integer auto-increment (list mein ID column nahi hai, par edit/delete
      ke liye chahiye).
    - slug unique hai (URL-friendly identifier).
    - status: "active" | "inactive".
    - show_on_header: bool (Yes/No).
    - No user FK (UI mein Created By/Updated By columns nahi the).
    """

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    name = Column(String(150), nullable=False)
    slug = Column(String(150), nullable=False, unique=True, index=True)
    status = Column(String(20), nullable=False, default="active")  # active | inactive
    show_on_header = Column(Boolean, nullable=False, default=False)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )