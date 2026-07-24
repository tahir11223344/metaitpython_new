from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Har logged-in user (admin ho ya normal) ke liye — sirf ye check karta hai
    ke token valid hai. Frontend 'Authorization: Bearer <token>' header bhejta
    hai (token localStorage["token"] mein store hota hai).
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    return user


def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Ye dependency sirf ADMIN users ko pass hone deti hai.
    Dashboard/admin-only routes mein isay use karo, get_current_user ki jagah:

        @router.get("/dashboard-data")
        def get_data(admin: User = Depends(get_current_admin_user)):
            ...

    Normal (non-admin) user agar try kare to 403 Forbidden milega.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource",
        )
    return current_user
