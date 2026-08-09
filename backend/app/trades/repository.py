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
    # Browse is for trades that can still receive an offer. Reserved/completed
    # trades remain visible to their participants through My Trades/Offer History.
    query = Trade.query.filter(Trade.status == TradeStatus.OPEN)

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
            Trade.status != TradeStatus.DELETED,
        )
        .order_by(Trade.created_at.desc())
    )


def create_trade(trade):
    db.session.add(trade)
    db.session.commit()
    return trade


def save_trade(trade):
    db.session.commit()
    return trade


def complete_due_trade_requests(cutoff, completed_at):
    """Complete owner-requested trades whose three-day confirmation window expired."""
    count = (
        Trade.query
        .filter(
            Trade.status == TradeStatus.RESERVED,
            Trade.completion_requested_at.isnot(None),
            Trade.completion_requested_at <= cutoff,
        )
        .update(
            {
                Trade.status: TradeStatus.COMPLETED,
                Trade.completed_at: completed_at,
                Trade.updated_at: completed_at,
            },
            synchronize_session=False,
        )
    )
    if count:
        db.session.commit()
    return count
