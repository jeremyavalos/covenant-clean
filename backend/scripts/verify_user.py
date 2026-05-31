import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from database import SessionLocal  # noqa: E402
from models import User  # noqa: E402


def verify_user(email: str, dry_run: bool) -> int:
    normalized_email = email.strip().lower()

    if not normalized_email:
        print("Email is required.")
        return 2

    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == normalized_email).first()

        if user is None:
            print(f"No user found for {normalized_email}.")
            return 1

        if user.is_verified:
            print(f"User {normalized_email} is already verified.")
            return 0

        user.is_verified = True
        user.verification_token = None
        user.token_expires = None
        user.verified_at = datetime.now(timezone.utc)

        if dry_run:
            db.rollback()
            print(f"Dry run: {normalized_email} would be marked verified.")
            return 0

        db.commit()
        print(f"User {normalized_email} marked verified.")
        return 0
    finally:
        db.close()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Mark a Covenant user email as verified."
    )
    parser.add_argument("--email", required=True, help="User email to verify.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Check the user without committing changes.",
    )
    args = parser.parse_args()

    return verify_user(args.email, args.dry_run)


if __name__ == "__main__":
    raise SystemExit(main())
