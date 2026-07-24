from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Blog(Base):
    """
    Blog post.

    - category_id -> categories.id (dashboard ki Categories se dropdown banta hai)
    - description: rich text HTML (editor se)
    - image: sirf URL string; file pehle /media/image pe upload hoti hai
      (Industry jaisa pattern — isliye create/update JSON hain, multipart nahi)
    """

    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True, index=True)

    category_id = Column(
        Integer,
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    is_active = Column(Boolean, nullable=False, default=True)

    # "Marketing" jaise fixed options — allowed list schemas/blogs.py mein hai
    type = Column(String(100), nullable=True)

    # String rakha hai taake "5 min read" ya "5" dono chal jayein.
    # Sirf number chahiye ho to isse Integer kar dein (schema mein bhi int).
    read_time = Column(String(50), nullable=True)

    image = Column(String(500), nullable=True)
    image_alt = Column(String(255), nullable=True)

    short_description = Column(Text, nullable=True)
    description = Column(Text, nullable=True)  # HTML

    meta_title = Column(String(255), nullable=True)
    meta_keyword = Column(Text, nullable=True)
    meta_description = Column(Text, nullable=True)

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