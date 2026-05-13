import json

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    is_verified = Column(Boolean, default=False)
    is_pro = Column(Boolean, default=False)

    verification_code = Column(String, nullable=True)
    verification_token = Column(String, unique=True, index=True, nullable=True)
    reset_token = Column(String, unique=True, index=True, nullable=True)
    token_expires = Column(DateTime(timezone=True), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    progress = relationship(
        "Progress",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Progress(Base):
    __tablename__ = "progress"
    __table_args__ = (
        UniqueConstraint("user_id", "habit_key", name="uq_progress_user_habit"),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    habit_key = Column(String, index=True, nullable=False)

    completed_days = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    total_progress = Column(Integer, default=0)
    sessions = Column(Integer, default=0)

    last_completed = Column(String, nullable=True)
    completion_dates_raw = Column("completion_dates", Text, default="[]")

    data = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    user = relationship(
        "User",
        back_populates="progress",
    )

    @property
    def completion_dates(self):
        if not self.completion_dates_raw:
            return []

        try:
            dates = json.loads(self.completion_dates_raw)
        except json.JSONDecodeError:
            return []

        return dates if isinstance(dates, list) else []

    @completion_dates.setter
    def completion_dates(self, dates):
        self.completion_dates_raw = json.dumps(dates or [])


class GiftCode(Base):
    __tablename__ = "gift_codes"

    id = Column(Integer, primary_key=True, index=True)

    code = Column(String, unique=True, index=True, nullable=False)

    is_active = Column(Boolean, default=True)

    max_uses = Column(Integer, default=1)
    used_count = Column(Integer, default=0)

    entitlement = Column(String, default="covenant_pro")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    redemptions = relationship(
        "GiftCodeRedemption",
        back_populates="gift_code",
        cascade="all, delete-orphan",
    )


class GiftCodeRedemption(Base):
    __tablename__ = "gift_code_redemptions"

    id = Column(Integer, primary_key=True, index=True)

    gift_code_id = Column(Integer, ForeignKey("gift_codes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    redeemed_at = Column(DateTime(timezone=True), server_default=func.now())

    gift_code = relationship(
        "GiftCode",
        back_populates="redemptions",
    )
    user = relationship("User")
