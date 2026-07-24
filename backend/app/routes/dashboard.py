from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.deps import get_current_admin_user  # <-- normal wala nahi, admin wala

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard (Admin only)"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),  # <-- ye line access control karti hai
):
    """
    Ye route sirf is_admin=True wale user access kar sakte hain.
    Koi normal user token bhi bhej de, 403 Forbidden milega.
    """
    total_users = db.query(User).count()

    return {
        "message": f"Welcome, {admin.full_name}",
        "total_users": total_users,
    }
