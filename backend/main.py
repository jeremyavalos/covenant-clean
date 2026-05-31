import os
import secrets
from html import escape
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from auth import (
    create_access_token,
    get_current_user,
    hash_password,
    normalize_email,
    verify_password,
)
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


def normalize_language(language: str | None):
    return language if language in {"en", "es"} else "en"


def send_verification_for_user(user: User, language: str | None = None):
    send_verification_email(
        user.email,
        user.verification_token,
        normalize_language(language),
    )
    print(f"[Covenant auth] Verification email sent to user {user.id}.")


def send_reset_for_user(user: User, language: str | None = None):
    send_password_reset_email(
        user.email,
        user.reset_token,
        normalize_language(language),
    )
    print(f"[Covenant auth] Password reset email sent to user {user.id}.")


def find_user_by_email(db: Session, email: str):
    normalized_email = normalize_email(email)
    return db.query(User).filter(func.lower(User.email) == normalized_email).first()


def render_verification_page(success: bool, language: str | None = None) -> HTMLResponse:
    language = normalize_language(language)
    copy = {
        "en": {
            "title": "Email verified." if success else "Verification link expired.",
            "message": (
                "Email verified. You can now return to Covenant."
                if success
                else "This verification link is invalid or expired. Please request a new verification email."
            ),
            "secondary": (
                "Correo verificado. Ya puedes volver a Covenant."
                if success
                else "Este enlace es invalido o expiro. Solicita un nuevo correo de verificacion."
            ),
        },
        "es": {
            "title": "Correo verificado." if success else "El enlace expiro.",
            "message": (
                "Correo verificado. Ya puedes volver a Covenant."
                if success
                else "Este enlace es invalido o expiro. Solicita un nuevo correo de verificacion."
            ),
            "secondary": (
                "Email verified. You can now return to Covenant."
                if success
                else "This verification link is invalid or expired. Please request a new verification email."
            ),
        },
    }[language]
    title = copy["title"]
    accent = "#d88c3a" if success else "#ffb08c"

    return HTMLResponse(
        content=f"""
        <!doctype html>
        <html lang="{language}">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Covenant - {title}</title>
          </head>
          <body style="margin:0;min-height:100vh;background:#050505;color:#fff8ef;font-family:Inter,Arial,sans-serif;display:grid;place-items:center;padding:24px;">
            <main style="width:min(100%,560px);border:1px solid rgba(216,140,58,0.34);background:#0b0b0b;padding:36px 28px;text-align:center;">
              <p style="margin:0 0 18px;color:#d88c3a;font-size:12px;font-weight:800;letter-spacing:6px;">COVENANT</p>
              <h1 style="margin:0 0 16px;color:{accent};font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:1.05;font-weight:400;">{title}</h1>
              <p style="margin:0 auto 12px;max-width:430px;color:#c9c0b4;font-size:17px;line-height:1.7;">{copy["message"]}</p>
              <p style="margin:0 auto;max-width:430px;color:#8f867c;font-size:14px;line-height:1.6;">{copy["secondary"]}</p>
            </main>
          </body>
        </html>
        """,
        status_code=status.HTTP_200_OK if success else status.HTTP_400_BAD_REQUEST,
    )


def verify_user_email_token(token: str, db: Session) -> bool:
    user = db.query(User).filter(User.verification_token == token).first()

    if user is None or is_expired(user.token_expires):
        print("[Covenant auth] Invalid or expired verification token.")
        return False

    user.is_verified = True
    user.verification_token = None
    user.token_expires = None
    user.verified_at = now_utc()
    db.commit()

    print(f"[Covenant auth] User {user.id} verified email.")
    return True


def has_valid_reset_token(token: str, db: Session) -> bool:
    user = db.query(User).filter(User.reset_token == token).first()

    if user is None or is_expired(user.token_expires):
        print("[Covenant auth] Invalid or expired password reset token page.")
        return False

    return True


def render_reset_password_page(
    token: str,
    valid: bool,
    language: str | None = None,
) -> HTMLResponse:
    language = normalize_language(language)
    copy = {
        "en": {
            "expired_title": "Reset link expired.",
            "expired_message": "This password reset link is invalid or expired. Please request a new password reset email from Covenant.",
            "title": "Reset your password.",
            "subtitle": "Choose a new password to return to Covenant.",
            "password": "New password",
            "confirm": "Confirm password",
            "button": "RESET PASSWORD",
            "mismatch": "Passwords do not match.",
            "generic": "Could not reset password.",
            "success": "Password reset. You can now return to Covenant.",
        },
        "es": {
            "expired_title": "El enlace expiro.",
            "expired_message": "Este enlace para restablecer tu contraseña es invalido o expiro. Solicita un nuevo correo desde Covenant.",
            "title": "Restablece tu contraseña.",
            "subtitle": "Elige una nueva contraseña para volver a Covenant.",
            "password": "Nueva contraseña",
            "confirm": "Confirmar contraseña",
            "button": "RESTABLECER",
            "mismatch": "Las contraseñas no coinciden.",
            "generic": "No se pudo restablecer la contraseña.",
            "success": "Contraseña restablecida. Ya puedes volver a Covenant.",
        },
    }[language]

    if not valid:
        return HTMLResponse(
            content=f"""
            <!doctype html>
            <html lang="{language}">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Covenant - {copy["expired_title"]}</title>
              </head>
              <body style="margin:0;min-height:100vh;background:#050505;color:#fff8ef;font-family:Inter,Arial,sans-serif;display:grid;place-items:center;padding:24px;">
                <main style="width:min(100%,560px);border:1px solid rgba(216,140,58,0.34);background:#0b0b0b;padding:36px 28px;text-align:center;">
                  <p style="margin:0 0 18px;color:#d88c3a;font-size:12px;font-weight:800;letter-spacing:6px;">COVENANT</p>
                  <h1 style="margin:0 0 16px;color:#ffb08c;font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:1.05;font-weight:400;">{copy["expired_title"]}</h1>
                  <p style="margin:0 auto;max-width:430px;color:#c9c0b4;font-size:17px;line-height:1.7;">{copy["expired_message"]}</p>
                </main>
              </body>
            </html>
            """,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    safe_token = escape(token, quote=True)
    content = """
    <!doctype html>
    <html lang="__LANGUAGE__">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Covenant - __TITLE__</title>
      </head>
      <body style="margin:0;min-height:100vh;background:#050505;color:#fff8ef;font-family:Inter,Arial,sans-serif;display:grid;place-items:center;padding:24px;">
        <main style="width:min(100%,560px);border:1px solid rgba(216,140,58,0.34);background:#0b0b0b;padding:34px 28px;text-align:center;">
          <p style="margin:0 0 18px;color:#d88c3a;font-size:12px;font-weight:800;letter-spacing:6px;">COVENANT</p>
          <h1 style="margin:0 0 12px;color:#fff8ef;font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:1.05;font-weight:400;">__TITLE__</h1>
          <p style="margin:0 auto 24px;max-width:430px;color:#c9c0b4;font-size:16px;line-height:1.6;">__SUBTITLE__</p>
          <form id="reset-form" action="/auth/reset-password" method="post" style="display:grid;gap:14px;text-align:left;">
            <input id="token" name="token" type="hidden" value="__TOKEN__" />
            <label style="display:grid;gap:8px;color:#d8c2aa;font-size:13px;">
              __PASSWORD_LABEL__
              <input id="password" name="password" type="password" minlength="8" maxlength="72" required style="min-height:54px;border-radius:14px;border:1px solid rgba(255,255,255,0.12);background:#050505;color:#fff8ef;font-size:16px;padding:0 16px;" />
            </label>
            <label style="display:grid;gap:8px;color:#d8c2aa;font-size:13px;">
              __CONFIRM_LABEL__
              <input id="confirm-password" name="confirm_password" type="password" minlength="8" maxlength="72" required style="min-height:54px;border-radius:14px;border:1px solid rgba(255,255,255,0.12);background:#050505;color:#fff8ef;font-size:16px;padding:0 16px;" />
            </label>
            <p id="message" style="min-height:22px;margin:0;color:#ffb08c;font-size:14px;line-height:1.5;text-align:center;"></p>
            <button type="submit" style="min-height:56px;border-radius:16px;border:1px solid rgba(216,140,58,0.62);background:rgba(216,110,34,0.22);color:#ffd1a0;font-size:12px;font-weight:800;letter-spacing:4px;">__BUTTON__</button>
          </form>
        </main>
        <script>
          const form = document.getElementById("reset-form");
          const message = document.getElementById("message");
          form.addEventListener("submit", async (event) => {
            event.preventDefault();
            message.style.color = "#ffb08c";
            message.textContent = "";

            const token = document.getElementById("token").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            if (password !== confirmPassword) {
              message.textContent = "__MISMATCH__";
              return;
            }

            try {
              const response = await fetch("/auth/reset-password", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  token,
                  password
                })
              });

              if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.detail || "__GENERIC__");
              }

              form.reset();
              message.style.color = "#ffd1a0";
              message.textContent = "__SUCCESS__";
            } catch (error) {
              message.textContent = error.message || "__GENERIC__";
            }
          });
        </script>
      </body>
    </html>
    """

    replacements = {
        "__LANGUAGE__": language,
        "__TITLE__": copy["title"],
        "__SUBTITLE__": copy["subtitle"],
        "__TOKEN__": safe_token,
        "__PASSWORD_LABEL__": copy["password"],
        "__CONFIRM_LABEL__": copy["confirm"],
        "__BUTTON__": copy["button"],
        "__MISMATCH__": copy["mismatch"],
        "__GENERIC__": copy["generic"],
        "__SUCCESS__": copy["success"],
    }

    for placeholder, value in replacements.items():
        content = content.replace(placeholder, value)

    return HTMLResponse(content=content)


@app.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    email = normalize_email(payload.email)
    existing_user = find_user_by_email(db, email)

    if existing_user:
        if not existing_user.is_verified:
            assign_verification_token(existing_user)
            db.commit()
            db.refresh(existing_user)

            try:
                send_verification_for_user(existing_user, payload.language)
            except Exception as exc:
                print(
                    f"[Covenant auth] Verification email failed for existing unverified user {existing_user.id}: {exc}"
                )
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Could not send verification email.",
                ) from exc

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please verify your email first.",
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="That email is already registered.",
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
        send_verification_for_user(user, payload.language)
    except Exception as exc:
        print(
            f"[Covenant auth] Verification email failed for user {user.id}: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not send verification email.",
        ) from exc

    return MessageResponse(message="Verification email sent.")


@app.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    email = normalize_email(payload.email)
    user = find_user_by_email(db, email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_verified:
        print(f"[Covenant auth] Login blocked for unverified user {user.id}.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email first.",
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token({"sub": str(user.id)})
    return Token(access_token=access_token)


@app.post("/auth/send-verification", response_model=MessageResponse)
def send_verification(payload: EmailRequest, db: Session = Depends(get_db)):
    email = normalize_email(payload.email)
    user = find_user_by_email(db, email)

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
        send_verification_for_user(user, payload.language)
    except Exception as exc:
        print(f"[Covenant auth] Verification email failed for user {user.id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not send verification email.",
        ) from exc

    return MessageResponse(message="Verification email sent.")


@app.get("/auth/verify-email", response_class=HTMLResponse)
def verify_email_link(
    token: str = Query(..., min_length=16, max_length=512),
    language: str | None = Query(None),
    db: Session = Depends(get_db),
):
    verified = verify_user_email_token(token, db)
    return render_verification_page(verified, language)


@app.post("/auth/verify-email", response_model=MessageResponse)
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    verified = verify_user_email_token(payload.token, db)

    if not verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token.",
        )

    return MessageResponse(message="Email verified.")


@app.post("/auth/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = normalize_email(payload.email)
    user = find_user_by_email(db, email)

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
        send_reset_for_user(user, payload.language)
    except Exception as exc:
        print(f"[Covenant auth] Password reset email failed for user {user.id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not send password reset email.",
        ) from exc

    return generic_response


@app.get("/auth/reset-password", response_class=HTMLResponse)
def reset_password_link(
    token: str = Query(..., min_length=16, max_length=512),
    language: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return render_reset_password_page(
        token,
        has_valid_reset_token(token, db),
        language,
    )


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
