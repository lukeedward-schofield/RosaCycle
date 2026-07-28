from app.database import db
from app.models.enums import NotificationType
from app.utils.mixins import utcnow, uuid_pk_column


class Notification(db.Model):
    __tablename__ = "notifications"

    id = uuid_pk_column()
    recipient_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)

    type = db.Column(db.Enum(NotificationType), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    body = db.Column(db.String(255), nullable=False)

    related_trade_id = db.Column(db.String(36), db.ForeignKey("trades.id"), nullable=True)
    related_offer_id = db.Column(db.String(36), db.ForeignKey("offers.id"), nullable=True)

    is_read = db.Column(db.Boolean, nullable=False, default=False, index=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    recipient = db.relationship("User", back_populates="notifications")
