"""Database ORM models and Pydantic schemas."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel
from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String(64), index=True)
    speaker = Column(String(32), default="speaker_1")
    text = Column(Text)
    translation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class TranscriptCreate(BaseModel):
    room_id: str
    speaker: str
    text: str
    translation: Optional[str] = None


class TranscriptRead(BaseModel):
    id: int
    room_id: str
    speaker: str
    text: str
    translation: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True


class TranscriptList(BaseModel):
    items: List[TranscriptRead]


