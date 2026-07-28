def serialize_rating(rating):
    return {
        "id": rating.id,
        "tradeId": rating.trade_id,
        "raterId": rating.rater_id,
        "ratedId": rating.rated_id,
        "score": rating.score,
        "comment": rating.comment,
        "createdAt": rating.created_at.isoformat(),
    }
