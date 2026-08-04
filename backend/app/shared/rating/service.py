from app.shared.models.enums import TradeStatus
from app.shared.rating.model import Rating
from app.trades.offer.repository import get_accepted_offer
from app.shared.rating.repository import average_for_user, create_rating, list_for_user as repo_list_for_user
from app.trades.repository import get_trade_by_id
from app.shared.utils.errors import ForbiddenError, NotFoundError, ValidationError


def _other_party(trade, rater_id):
    accepted_offer = get_accepted_offer(trade.id)
    if accepted_offer is None:
        raise ForbiddenError("This trade has no accepted offer to rate.")

    if rater_id == trade.owner_id:
        return accepted_offer.offerer_id
    if rater_id == accepted_offer.offerer_id:
        return trade.owner_id
    raise ForbiddenError("Only the two parties of a trade may rate each other.")


def rate_trade(trade_id, rater_id, *, score, comment=None):
    trade = get_trade_by_id(trade_id)
    if trade is None:
        raise NotFoundError("Trade not found.")
    if trade.status != TradeStatus.COMPLETED:
        raise ForbiddenError("You can only rate completed trades.")
    if not isinstance(score, int) or score < 1 or score > 5:
        raise ValidationError("score must be an integer between 1 and 5.")

    rated_id = _other_party(trade, rater_id)

    rating = Rating(trade_id=trade.id, rater_id=rater_id, rated_id=rated_id, score=score, comment=comment)
    return create_rating(rating)


def list_for_user(user_id):
    return {
        "ratings": repo_list_for_user(user_id),
        "average": average_for_user(user_id),
    }
