from app.shared.database import db
from app.trades.model import Trade
from app.shared.models.enums import TradeStatus


def get_trade_by_id(trade_id):
    return db.session.get(Trade, trade_id)

def get_active_trade_by_id(trade_id):
    return (
        Trade.query
        .filter(
            Trade.id == trade_id,
            Trade.status != TradeStatus.DELETED,
        )
        .first()
    )

def list_browse(*, exclude_owner_id=None, category=None, location=None):
    query = Trade.query.filter(Trade.status != TradeStatus.DELETED)
    
    if exclude_owner_id is not None:
        query = query.filter(Trade.owner_id != exclude_owner_id)

    if category:
        query = query.filter(db.func.lower(Trade.category) == category.lower())

    if location:
        query = query.filter(Trade.location_text.ilike(f"%{location}%"))

    return query.order_by(Trade.created_at.desc())


def list_mine(owner_id):
    return (
        Trade.query
        .filter(
                Trade.owner_id == owner_id,
                Trade.status != TradeStatus.DELETED
            )
        .order_by(Trade.created_at.desc()))


def create_trade(trade):
    db.session.add(trade)
    db.session.commit()
    return trade


def save_trade(trade):
    db.session.commit()
    return trade
