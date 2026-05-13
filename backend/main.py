import os
import secrets
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from auth import create_access_token, get_current_user, hash_password, verify_password
from database import Base, engine, get_db
from models import Progress, User
from schemas import (
    EmailRequest,
    ForgotPasswordRequest,
    MessageResponse,
    ProgressOut,
    ProgressSave,
    ResetPasswordRequest,
    Token,
    UserCreate,
    UserLogin,
    UserOut,
    VerifyEmailRequest,
)
from services.email_service import send_password_reset_email, send_verification_email

load_dotenv()

Base.metadata.create_all(bind=engine)

VERIFICATION_TOKEN_EXPIRE_HOURS = int(
    os.getenv("VERIFICATION_TOKEN_EXPIRE_HOURS", "24")
)
RESET_TOKEN_EXPIRE_MINUTES = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "60"))


def ensure_progress_columns():
    statements = [
        "ALTER TABLE progress ADD COLUMN IF NOT EXISTS total_progress INTEGER DEFAULT 0",
        "ALTER TABLE progress ADD COLUMN IF NOT EXISTS sessions INTEGER DEFAULT 0",
        "ALTER TABLE progress ADD COLUMN IF NOT EXISTS completion_dates TEXT DEFAULT '[]'",
    ]

    with engine.begin() as connection:
        dialect = connection.dialect.name

        if dialect == "postgresql":
            for statement in statements:
                connection.execute(text(statement))
            return

        if dialect == "sqlite":
            existing_columns = {
                row[1] for row in connection.execute(text("PRAGMA table_info(progress)"))
            }

            sqlite_columns = {
                "total_progress": "ALTER TABLE progress ADD COLUMN total_progress INTEGER DEFAULT 0",
                "sessions": "ALTER TABLE progress ADD COLUMN sessions INTEGER DEFAULT 0",
                "completion_dates": "ALTER TABLE progress ADD COLUMN completion_dates TEXT DEFAULT '[]'",
            }

            for column, statement in sqlite_columns.items():
                if column not in existing_columns:
                    connection.execute(text(statement))


def ensure_user_auth_columns():
    postgresql_statements = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS token_expires TIMESTAMP WITH TIME ZONE",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE",
    ]

    with engine.begin() as connection:
        dialect = connection.dialect.name

        if dialect == "postgresql":
            for statement in postgresql_statements:
                connection.execute(text(statement))
            return

        if dialect == "sqlite":
            existing_columns = {
                row[1] for row in connection.execute(text("PRAGMA table_info(users)"))
            }

            sqlite_columns = {
                "is_verified": "ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE",
                "verification_token": "ALTER TABLE users ADD COLUMN verification_token VARCHAR",
                "reset_token": "ALTER TABLE users ADD COLUMN reset_token VARCHAR",
                "token_expires": "ALTER TABLE users ADD COLUMN token_expires DATETIME",
                "verified_at": "ALTER TABLE users ADD COLUMN verified_at DATETIME",
            }

            for column, statement in sqlite_columns.items():
                if column not in existing_columns:
                    connection.execute(text(statement))


ensure_progress_columns()
ensure_user_auth_columns()

app = FastAPI(title="Covenant API")

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:8081,http://localhost:19006,http://127.0.0.1:8081",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok"}


def now_utc():
    return datetime.now(timezone.utc)


def generate_token():
    return secrets.token_urlsafe(48)


def verification_expires_at():
    return now_utc() + timedelta(hours=VERIFICATION_TOKEN_EXPIRE_HOURS)


def reset_expires_at():
    return now_utc() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)


def is_expired(expires_at):
    if expires_at is None:
        return True

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    return expires_at < now_utc()


def assign_verification_token(user: User):
    user.verification_token = generate_token()
    user.token_expires = verification_expires_at()


def assign_reset_token(user: User):
    user.reset_token = generate_token()
    user.token_expires = reset_expires_at()


def send_verification_for_user(user: User):
    send_verification_email(user.email, user.verification_token)
    print(f"[Covenant auth] Verification email sent to user {user.id}.")


def send_reset_for_user(user: User):
    send_password_reset_email(user.email, user.reset_token)
    print(f"[Covenant auth] Password reset email sent to user {user.id}.")


@app.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    email = payload.email.lower()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        is_verified=False,
    )
    assign_verification_token(user)
    db.add(user)
    db.commit()
    db.refresh(user)

    try:
        send_verification_for_user(user)
    except Exception as exc:
        print(
            f"[Covenant auth] Verification email failed for user {user.id}: {exc}"
        )

    access_token = create_access_token({"sub": str(user.id)})
    return Token(access_token=access_token)


@app.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token({"sub": str(user.id)})
    return Token(access_token=access_token)


@app.post("/auth/send-verification", response_model=MessageResponse)
def send_verification(payload: EmailRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()

    if user is None:
        print("[Covenant auth] Verification requested for unknown email.")
        return MessageResponse(
            message="If the account exists, a verification email has been sent."
        )

    if user.is_verified:
        print(f"[Covenant auth] User {user.id} already verified.")
        return MessageResponse(message="Email is already verified.")

    assign_verification_token(user)
    db.commit()
    db.refresh(user)

    try:
        send_verification_for_user(user)
    except Exception as exc:
        print(f"[Covenant auth] Verification email failed for user {user.id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not send verification email.",
        ) from exc

    return MessageResponse(message="Verification email sent.")


@app.post("/auth/verify-email", response_model=MessageResponse)
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(User.verification_token == payload.token)
        .first()
    )

    if user is None or is_expired(user.token_expires):
        print("[Covenant auth] Invalid or expired verification token.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token.",
        )

    user.is_verified = True
    user.verification_token = None
    user.token_expires = None
    user.verified_at = now_utc()
    db.commit()

    print(f"[Covenant auth] User {user.id} verified email.")
    return MessageResponse(message="Email verified.")


@app.post("/auth/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()

    generic_response = MessageResponse(
        message="If the account exists, a password reset email has been sent."
    )

    if user is None:
        print("[Covenant auth] Password reset requested for unknown email.")
        return generic_response

    assign_reset_token(user)
    db.commit()
    db.refresh(user)

    try:
        send_reset_for_user(user)
    except Exception as exc:
        print(f"[Covenant auth] Password reset email failed for user {user.id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not send password reset email.",
        ) from exc

    return generic_response


@app.post("/auth/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == payload.token).first()

    if user is None or is_expired(user.token_expires):
        print("[Covenant auth] Invalid or expired password reset token.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    user.password_hash = hash_password(payload.password)
    user.reset_token = None
    user.token_expires = None
    db.commit()

    print(f"[Covenant auth] User {user.id} reset password.")
    return MessageResponse(message="Password reset successful.")


@app.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/progress/save", response_model=ProgressOut)
def save_progress(
    payload: ProgressSave,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    progress = (
        db.query(Progress)
        .filter(
            Progress.user_id == current_user.id,
            Progress.habit_key == payload.habit_key,
        )
        .first()
    )

    if progress is None:
        progress = Progress(
            user_id=current_user.id,
            habit_key=payload.habit_key,
        )
        db.add(progress)

    progress.completed_days = payload.completed_days
    progress.streak = payload.streak
    progress.last_completed = payload.last_completed
    progress.completion_dates = payload.completion_dates
    progress.total_progress = payload.total_progress or min(
        round((payload.completed_days / 30) * 100),
        100,
    )
    progress.sessions = payload.sessions
    progress.data = payload.data

    db.commit()
    db.refresh(progress)
    return serialize_progress(progress, current_user)


@app.get("/progress", response_model=list[ProgressOut])
def get_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    progress_rows = (
        db.query(Progress)
        .filter(Progress.user_id == current_user.id)
        .order_by(Progress.habit_key.asc())
        .all()
    )

    return [serialize_progress(progress, current_user) for progress in progress_rows]


def serialize_progress(progress: Progress, user: User):
    return {
        "id": progress.id,
        "habit_key": progress.habit_key,
        "completed_days": progress.completed_days or 0,
        "streak": progress.streak or 0,
        "last_completed": progress.last_completed,
        "completion_dates": progress.completion_dates,
        "total_progress": progress.total_progress or 0,
        "sessions": progress.sessions or 0,
        "is_pro": bool(user.is_pro),
        "data": progress.data,
    }
