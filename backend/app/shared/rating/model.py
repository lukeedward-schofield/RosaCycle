from app.shared.database import db
from app.shared.utils.mixins import utcnow, uuid_pk_column


class Rating(db.Model):
    __tablename__ = "ratings"
    __table_args__ = (
        db.UniqueConstraint("trade_id", "rater_id", name="uq_rating_trade_rater"),
        db.CheckConstraint("score >= 1 AND score <= 5", name="ck_rating_score_range"),
    )

    id = uuid_pk_column()
    trade_id = db.Column(db.String(36), db.ForeignKey("trades.id"), nullable=False, index=True)
    rater_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    rated_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)

    score = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.String(500), nullable=True)

    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
