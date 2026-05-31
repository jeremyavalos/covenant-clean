from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class EmailNormalizedModel(BaseModel):
    @field_validator("email", mode="before", check_fields=False)
    @classmethod
    def normalize_email(cls, value):
        if isinstance(value, str):
            return value.strip().lower()

        return value


class UserCreate(EmailNormalizedModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    language: Optional[Literal["en", "es"]] = None


class UserLogin(EmailNormalizedModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class EmailRequest(EmailNormalizedModel):
    email: EmailStr
    language: Optional[Literal["en", "es"]] = None


class VerifyEmailRequest(BaseModel):
    token: str = Field(min_length=16, max_length=512)


class ForgotPasswordRequest(EmailNormalizedModel):
    email: EmailStr
    language: Optional[Literal["en", "es"]] = None


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=16, max_length=512)
    password: str = Field(min_length=8, max_length=72)


class MessageResponse(BaseModel):
    message: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    is_verified: bool
    is_pro: bool


class ProgressSave(BaseModel):
    habit_key: str = Field(min_length=1, max_length=120)
    completed_days: int = 0
    streak: int = 0
    last_completed: Optional[str] = None
    completion_dates: list[str] = Field(default_factory=list)
    total_progress: Optional[int] = None
    sessions: int = 0
    data: Optional[str] = None


class ProgressOut(BaseModel):
    id: int
    habit_key: str
    completed_days: int
    streak: int
    last_completed: Optional[str] = None
    completion_dates: list[str] = Field(default_factory=list)
    total_progress: int
    sessions: int
    is_pro: bool
    data: Optional[str] = None
