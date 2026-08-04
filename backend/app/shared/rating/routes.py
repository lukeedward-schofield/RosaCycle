from flask import Blueprint

from app.shared.rating import controller as rating_controller
from app.auth.utils import require_auth

rating_bp = Blueprint("rating", __name__)


@rating_bp.post("/trades/<trade_id>/ratings")
@require_auth
def create_rating(trade_id):
    return rating_controller.create_rating(trade_id)


@rating_bp.get("/users/<user_id>/ratings")
@require_auth
def ratings_for_user(user_id):
    return rating_controller.ratings_for_user(user_id)
