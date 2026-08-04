from flask import g, request

from app.shared.rating.schema import serialize_rating
from app.shared.rating.service import list_for_user, rate_trade
from app.shared.utils.errors import ValidationError


def create_rating(trade_id):
    body = request.get_json(silent=True) or {}
    if "score" not in body:
        raise ValidationError("score is required.")

    rating = rate_trade(trade_id, g.current_user.id, score=body["score"], comment=body.get("comment"))
    return serialize_rating(rating), 201


def ratings_for_user(user_id):
    result = list_for_user(user_id)
    return {
        "ratings": [serialize_rating(r) for r in result["ratings"]],
        "average": result["average"],
    }, 200
