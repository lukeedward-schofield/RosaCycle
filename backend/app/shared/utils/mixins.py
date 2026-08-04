import uuid
from datetime import datetime, timezone

from app.shared.database import db


def utcnow():
    return datetime.now(timezone.utc)


def ensure_aware(dt):
    """SQLite drops tzinfo on round-trip even for DateTime(timezone=True) columns,
    while Postgres preserves it. Normalize so comparisons work on either backend."""
    if dt is not None and dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def uuid_pk_column():
    return db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
