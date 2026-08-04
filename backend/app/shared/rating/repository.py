from sqlalchemy.exc import IntegrityError

from app.shared.database import db
from app.shared.rating.model import Rating
from app.shared.utils.errors import ConflictError


def list_for_user(user_id):
    return Rating.query.filter_by(rated_id=user_id).order_by(Rating.created_at.desc()).all()


def average_for_user(user_id):
    result = db.session.query(db.func.avg(Rating.score)).filter(Rating.rated_id == user_id).scalar()
    return float(result) if result is not None else None


def create_rating(rating):
    db.session.add(rating)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise ConflictError("You have already rated this trade.")
    return rating
