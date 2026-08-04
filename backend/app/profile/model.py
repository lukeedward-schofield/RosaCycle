from app.shared.database import db
from app.shared.models.enums import UserRole
from app.shared.utils.mixins import utcnow, uuid_pk_column


class User(db.Model):
    __tablename__ = "users"

    id = uuid_pk_column()
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    profile_image_path = db.Column(db.String(255), nullable=True)
    role = db.Column(db.Enum(UserRole), default=UserRole.USER, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    profile_updated_at = db.Column(db.DateTime(timezone=True), nullable=True)

    trades = db.relationship("Trade", back_populates="owner", lazy="dynamic")
    offers = db.relationship("Offer", back_populates="offerer", lazy="dynamic")
    resource_spots = db.relationship("ResourceSpot", back_populates="reporter", lazy="dynamic")
    notifications = db.relationship("Notification", back_populates="recipient", lazy="dynamic")
