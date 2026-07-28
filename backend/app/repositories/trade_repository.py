from app.database import db
from app.models.trade import Trade


def get_trade_by_id(trade_id):
    return db.session.get(Trade, trade_id)


def list_browse(*, exclude_owner_id=None, category=None, location=None):
    query = Trade.query
    if exclude_owner_id is not None:
        query = query.filter(Trade.owner_id != exclude_owner_id)
    if category:
        query = query.filter(db.func.lower(Trade.category) == category.lower())
    if location:
        query = query.filter(Trade.location_text.ilike(f"%{location}%"))
    return query.order_by(Trade.created_at.desc())


def list_mine(owner_id):
    return Trade.query.filter_by(owner_id=owner_id).order_by(Trade.created_at.desc())


def create_trade(trade):
    db.session.add(trade)
    db.session.commit()
    return trade


def save_trade(trade):
    db.session.commit()
    return trade
