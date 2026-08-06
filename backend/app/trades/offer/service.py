from app.shared.models.enums import NotificationType, OfferStatus, TradeStatus
from app.trades.offer.model import Offer
from app.trades.offer.repository import (
    add_offer,
    get_offer_by_id,
    list_by_trade as repo_list_by_trade,
    list_received as repo_list_received,
    list_sent as repo_list_sent,
    save,
)
from app.trades.repository import get_trade_by_id
from app.shared.notification.service import notify
from app.shared.utils.errors import ConflictError, ForbiddenError, NotFoundError, ValidationError
from app.shared.utils.file_storage import save_image
from app.shared.utils.mixins import utcnow

from app.trades.messaging.service import create_conversation_if_needed

REQUIRED_OFFER_FIELDS = ("itemName", "category", "material")


def send_offer(trade_id, offerer_id, *, fields, image_file):
    trade = get_trade_by_id(trade_id)
    if trade is None:
        raise NotFoundError("Trade not found.")
    if trade.owner_id == offerer_id:
        raise ForbiddenError("You cannot send an offer on your own trade.")
    if trade.status != TradeStatus.OPEN:
        raise ConflictError("This trade is no longer accepting offers.")

    missing = [f for f in REQUIRED_OFFER_FIELDS if not fields.get(f)]
    if missing:
        raise ValidationError(f"Missing required field(s): {', '.join(missing)}.")

    offer = Offer(
        trade_id=trade.id,
        offerer_id=offerer_id,
        item_name=fields["itemName"],
        category=fields["category"],
        material=fields["material"],
        weight_kg=fields.get("weightKg"),
        description=fields.get("description"),
        status=OfferStatus.PENDING,
    )
    if image_file is not None:
        offer.image_path = save_image(image_file, "offers")

    add_offer(offer)
    trade.status = TradeStatus.RESERVED
    save(offer, trade)

    notify(
        recipient_id=trade.owner_id,
        type=NotificationType.OFFER_RECEIVED,
        title="New offer received",
        body=f"You received an offer on \"{trade.item_name}\".",
        trade_id=trade.id,
        offer_id=offer.id,
    )
    return offer


def _get_offer_for_decision(offer_id, caller_id):
    offer = get_offer_by_id(offer_id)
    if offer is None:
        raise NotFoundError("Offer not found.")
    if offer.trade.owner_id != caller_id:
        raise ForbiddenError("Only the trade owner can decide on this offer.")
    if offer.status != OfferStatus.PENDING:
        raise ConflictError("This offer has already been decided.")
    return offer


def accept_offer(offer_id, caller_id):
    offer = _get_offer_for_decision(offer_id, caller_id)

    offer.status = OfferStatus.ACCEPTED
    offer.decided_at = utcnow()
    offer.trade.status = TradeStatus.COMPLETED

    create_conversation_if_needed(
        offer.trade,
        offer,
    )

    save(offer, offer.trade)

    notify(
        recipient_id=offer.offerer_id,
        type=NotificationType.OFFER_ACCEPTED,
        title="Offer accepted",
        body=f'Your offer on "{offer.trade.item_name}" was accepted!',
        trade_id=offer.trade_id,
        offer_id=offer.id,
    )

    return offer


def decline_offer(offer_id, caller_id):
    offer = _get_offer_for_decision(offer_id, caller_id)
    offer.status = OfferStatus.DECLINED
    offer.decided_at = utcnow()
    offer.trade.status = TradeStatus.OPEN
    save(offer, offer.trade)

    notify(
        recipient_id=offer.offerer_id,
        type=NotificationType.OFFER_DECLINED,
        title="Offer declined",
        body=f"Your offer on \"{offer.trade.item_name}\" was declined.",
        trade_id=offer.trade_id,
        offer_id=offer.id,
    )
    return offer


def list_by_trade(trade_id):
    return repo_list_by_trade(trade_id)


def list_sent(offerer_id):
    return repo_list_sent(offerer_id)


def list_received(owner_id):
    return repo_list_received(owner_id)
