from sqlalchemy.exc import IntegrityError

from app.database import db
from app.models.offer import Offer
from app.models.trade import Trade
from app.utils.errors import ConflictError


def get_offer_by_id(offer_id):
    return db.session.get(Offer, offer_id)


def list_by_trade(trade_id):
    return Offer.query.filter_by(trade_id=trade_id).order_by(Offer.created_at.desc()).all()


def get_accepted_offer(trade_id):
    from app.models.enums import OfferStatus

    return Offer.query.filter_by(trade_id=trade_id, status=OfferStatus.ACCEPTED).first()


def list_sent(offerer_id):
    return Offer.query.filter_by(offerer_id=offerer_id).order_by(Offer.created_at.desc()).all()


def list_received(owner_id):
    return (
        Offer.query.join(Trade, Offer.trade_id == Trade.id)
        .filter(Trade.owner_id == owner_id)
        .order_by(Offer.created_at.desc())
        .all()
    )


def add_offer(offer):
    db.session.add(offer)
    return offer


def save(*_objects):
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise ConflictError("This trade already has an active offer.")
