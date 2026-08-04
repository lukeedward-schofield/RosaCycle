from app.shared.database import db
from app.shared.models.enums import OfferStatus
from app.shared.utils.mixins import utcnow, uuid_pk_column


class Offer(db.Model):
    __tablename__ = "offers"
    __table_args__ = (
        db.Index(
            "ix_offers_one_pending_per_trade",
            "trade_id",
            unique=True,
            postgresql_where=db.text("status = 'PENDING'"),
            sqlite_where=db.text("status = 'PENDING'"),
        ),
    )

    id = uuid_pk_column()
    trade_id = db.Column(db.String(36), db.ForeignKey("trades.id"), nullable=False, index=True)
    offerer_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)

    item_name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    material = db.Column(db.String(120), nullable=False)
    weight_kg = db.Column(db.Numeric(8, 2), nullable=True)
    description = db.Column(db.Text, nullable=True)
    image_path = db.Column(db.String(255), nullable=True)

    status = db.Column(db.Enum(OfferStatus), nullable=False, default=OfferStatus.PENDING, index=True)

    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    decided_at = db.Column(db.DateTime(timezone=True), nullable=True)

    trade = db.relationship("Trade", back_populates="offers")
    offerer = db.relationship("User", back_populates="offers")
