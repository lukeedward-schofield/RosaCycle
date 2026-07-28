from datetime import timedelta

from app.database import db
from app.models.enums import ResourceSpotStatus
from app.utils.mixins import utcnow, uuid_pk_column


class ResourceSpot(db.Model):
    __tablename__ = "resource_spots"

    id = uuid_pk_column()
    reporter_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)

    name = db.Column(db.String(120), nullable=False)
    material = db.Column(db.String(120), nullable=False, index=True)
    weight_kg = db.Column(db.Numeric(8, 2), nullable=True)
    quantity = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)

    location_text = db.Column(db.String(255), nullable=False, index=True)
    permission_note = db.Column(db.String(255), nullable=True)

    image_path = db.Column(db.String(255), nullable=True)

    status = db.Column(db.Enum(ResourceSpotStatus), nullable=False, default=ResourceSpotStatus.ACTIVE, index=True)

    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    collected_at = db.Column(db.DateTime(timezone=True), nullable=True)

    reporter = db.relationship("User", back_populates="resource_spots")

    @staticmethod
    def default_expiry(days):
        return utcnow() + timedelta(days=days)
