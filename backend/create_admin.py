"""
Admin user banane ka CLI script.

Kyun zaroori hai: /api/auth/register se banne wala har user
hamesha is_admin=False hota hai (security ke liye — warna koi
bhi khud ko API se admin bana sakta). Pehla admin isi script
se banega, ya kisi existing user ko admin promote karne ke liye.

Usage:
    python create_admin.py

Phir prompts follow karo (email, naam, password) — agar wo email
already registered hai to us user ko admin bana dega (promote),
warna naya admin account bana dega.
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


def main():
    db = SessionLocal()

    print("=" * 50)
    print("Meta IT Services — Create/Promote Admin User")
    print("=" * 50)

    email = input("Email: ").strip().lower()

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        if existing_user.is_admin:
            print(f"\n'{email}' is already an admin. Nothing to do.")
        else:
            confirm = input(
                f"\nUser '{email}' already exists. Promote to admin? (y/n): "
            )
            if confirm.lower() == "y":
                existing_user.is_admin = True
                db.commit()
                print(f"\n✅ '{email}' has been promoted to admin.")
            else:
                print("\nCancelled.")
    else:
        full_name = input("Full name: ").strip()
        password = input("Password (min 8 characters): ").strip()

        if len(password) < 8:
            print("\n❌ Password must be at least 8 characters. Aborting.")
            db.close()
            return

        new_admin = User(
            full_name=full_name,
            email=email,
            hashed_password=hash_password(password),
            is_admin=True,
            is_active=True,
        )
        db.add(new_admin)
        db.commit()
        print(f"\n✅ Admin account created for '{email}'. You can now log in.")

    db.close()


if __name__ == "__main__":
    main()
