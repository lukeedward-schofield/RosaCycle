from app.shared.database import db
from app.shared.utils.mixins import utcnow, uuid_pk_column


class Conversation(db.Model):
    __tablename__ = "conversations"

    id = uuid_pk_column()

    trade_id = db.Column(
        db.String(36),
        db.ForeignKey("trades.id"),
        nullable=False,
        unique=True,
    )

    offer_id = db.Column(
        db.String(36),
        db.ForeignKey("offers.id"),
        nullable=False,
        unique=True,
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=utcnow,
        nullable=False,
    )

    trade = db.relationship("Trade", back_populates="conversation")
    offer = db.relationship("Offer", back_populates="conversation")

    messages = db.relationship(
        "Message",
        back_populates="conversation",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )


class Message(db.Model):
    __tablename__ = "messages"

    id = uuid_pk_column()

    conversation_id = db.Column(
        db.String(36),
        db.ForeignKey("conversations.id"),
        nullable=False,
        index=True,
    )

    sender_id = db.Column(
        db.String(36),
        db.ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    content = db.Column(db.Text, nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=utcnow,
        nullable=False,
    )

    read_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True,
    )

    conversation = db.relationship(
        "Conversation",
        back_populates="messages",
    )

    sender = db.relationship("User")