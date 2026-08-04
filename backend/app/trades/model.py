from app.shared.database import db
from app.shared.models.enums import TradeStatus, TradingForType
from app.shared.utils.mixins import utcnow, uuid_pk_column


class Trade(db.Model):
    __tablename__ = "trades"

    id = uuid_pk_column()
    owner_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)

    item_name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50), nullable=False, index=True)
    material = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    weight_kg = db.Column(db.Numeric(8, 2), nullable=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    location_text = db.Column(db.String(255), nullable=False, index=True)
    pickup_location_text = db.Column(db.String(255), nullable=True)

    trading_for_type = db.Column(db.Enum(TradingForType), nullable=False, default=TradingForType.NEGOTIATING)
    trading_for_value = db.Column(db.String(255), nullable=True)

    image_path = db.Column(db.String(255), nullable=True)

    status = db.Column(db.Enum(TradeStatus), nullable=False, default=TradeStatus.OPEN, index=True)

    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    owner = db.relationship("User", back_populates="trades")
    offers = db.relationship("Offer", back_populates="trade", lazy="dynamic", cascade="all, delete-orphan")

    @property
    def has_offers(self):
        return self.offers.count() > 0

    @property
    def offer_accepted(self):
        from app.shared.models.enums import OfferStatus

        return self.offers.filter_by(status=OfferStatus.ACCEPTED).first() is not None
