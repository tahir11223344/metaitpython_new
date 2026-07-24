import secrets
import bcrypt
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError

from app.core.config import settings


# --- Password hashing (bcrypt directly — passlib naye bcrypt versions ke
#     sath compatibility issues deta hai, isliye direct bcrypt use kar rahe hain) ---

def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")[:72]  # bcrypt ka max limit 72 bytes hai
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode("utf-8")[:72]
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(password_bytes, hashed_bytes)


# --- JWT access tokens ---

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


# --- Password reset tokens ---

def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)


def hash_reset_token(token: str) -> str:
    token_bytes = token.encode("utf-8")[:72]
    hashed = bcrypt.hashpw(token_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_reset_token(token: str, hashed_token: str) -> bool:
    token_bytes = token.encode("utf-8")[:72]
    hashed_bytes = hashed_token.encode("utf-8")
    return bcrypt.checkpw(token_bytes, hashed_bytes)


def reset_token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(
        minutes=settings.RESET_TOKEN_EXPIRE_MINUTES
    )