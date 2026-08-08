from flask import current_app

from app.shared.database import db
from app.shared.rating.model import Rating
from app.shared.utils.file_storage import build_media_url


def get_average_rating(user_id):
    result = (
        db.session.query(db.func.avg(Rating.score))
        .filter(Rating.rated_id == user_id)
        .scalar()
    )
    return round(result, 1) if result is not None else None


def serialize_user(user):
    return {
        "id": user.id,
        "username": user.username,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "email": user.email,
        "profileImage": build_media_url(user.profile_image_path),
        "role": user.role.value,
        "createdAt": user.created_at.isoformat(),
        "hasPassword": user.google_id is None,
        "infoUpdatedAt": user.info_updated_at.isoformat() if user.info_updated_at else None,
        "passwordUpdatedAt": user.password_updated_at.isoformat() if user.password_updated_at else None,
        "profileEditCooldownDays": current_app.config["PROFILE_EDIT_COOLDOWN_DAYS"],
        "rating": get_average_rating(user.id),
    }