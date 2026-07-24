from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    UserOut,
    UserUpdateProfile,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    Token,
    MessageResponse,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    generate_reset_token,
    hash_reset_token,
    verify_reset_token,
    reset_token_expiry,
)
from app.core.email import send_reset_password_email
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])


# ============ REGISTER ============
# Note: yahan se register hone wala user hamesha is_admin=False hota hai.
# Admin sirf script/manual DB update se banega (neeche dekho).

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


# ============ LOGIN ============

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated",
        )

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


# ============ GET PROFILE ============

@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


# ============ UPDATE PROFILE ============

@router.put("/me", response_model=UserOut)
def update_profile(
    payload: UserUpdateProfile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


# ============ CHANGE PASSWORD ============

@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()

    return {"detail": "Password changed successfully"}


# ============ FORGOT PASSWORD ============

@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    generic_message = {
        "detail": "If an account with that email exists, a reset link has been sent."
    }

    if not user:
        return generic_message

    raw_token = generate_reset_token()
    user.reset_token_hash = hash_reset_token(raw_token)
    user.reset_token_expires_at = reset_token_expiry()
    db.commit()

    send_reset_password_email(user.email, raw_token)

    return generic_message


# ============ RESET PASSWORD ============

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    users_with_pending_reset = (
        db.query(User).filter(User.reset_token_hash.isnot(None)).all()
    )

    matched_user = None
    for user in users_with_pending_reset:
        if verify_reset_token(payload.token, user.reset_token_hash):
            matched_user = user
            break

    if not matched_user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if matched_user.reset_token_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token has expired")

    matched_user.hashed_password = hash_password(payload.new_password)
    matched_user.reset_token_hash = None
    matched_user.reset_token_expires_at = None
    db.commit()

    return {"detail": "Password has been reset successfully. You can now log in."}
