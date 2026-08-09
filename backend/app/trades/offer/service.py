from app.shared.models.enums import NotificationType, OfferStatus, TradeStatus, TradingForType
from app.trades.offer.model import Offer
from app.trades.offer.repository import (
    add_offer,
    delete_offer as repo_delete_offer,
    get_offer_by_id,
    get_pending_offer_for_user,
    list_by_trade as repo_list_by_trade,
    list_other_pending_for_trade,
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

    if get_pending_offer_for_user(trade.id, offerer_id) is not None:
        raise ConflictError("You already have a pending offer for this trade.")

    is_free_trade = (
        trade.trading_for_type == TradingForType.NOTHING
    )

    if is_free_trade:
        offer = Offer(
            trade_id=trade.id,
            offerer_id=offerer_id,
            item_name=trade.item_name,
            category=trade.category,
            material=trade.material,
            weight_kg=trade.weight_kg,
            description=trade.description,
            status=OfferStatus.PENDING,
        )
    else:

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

    # A pending offer must not reserve the trade. Keeping the trade OPEN lets
    # other users submit competing offers until the owner accepts one.
    add_offer(offer)
    save(offer)

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

    if offer.trade.status != TradeStatus.OPEN:
        raise ConflictError("This trade already has an accepted offer.")

    now = utcnow()
    offer.status = OfferStatus.ACCEPTED
    offer.decided_at = now
    offer.trade.status = TradeStatus.RESERVED
    offer.trade.completion_requested_at = None
    offer.trade.completed_at = None

    # Once the owner chooses one offer, all competing pending offers are closed
    # so there can never be multiple accepted parties for the same trade.
    other_pending_offers = list_other_pending_for_trade(offer.trade_id, offer.id)
    for other_offer in other_pending_offers:
        other_offer.status = OfferStatus.DECLINED
        other_offer.decided_at = now

    create_conversation_if_needed(
        offer.trade,
        offer,
    )

    save(offer, offer.trade, *other_pending_offers)

    notify(
        recipient_id=offer.offerer_id,
        type=NotificationType.OFFER_ACCEPTED,
        title="Offer accepted",
        body=f'Your offer on "{offer.trade.item_name}" was accepted!',
        trade_id=offer.trade_id,
        offer_id=offer.id,
    )

    for other_offer in other_pending_offers:
        notify(
            recipient_id=other_offer.offerer_id,
            type=NotificationType.OFFER_DECLINED,
            title="Offer declined",
            body=f'Another offer on "{offer.trade.item_name}" was accepted by the owner.',
            trade_id=other_offer.trade_id,
            offer_id=other_offer.id,
        )

    return offer


def decline_offer(offer_id, caller_id):
    offer = _get_offer_for_decision(offer_id, caller_id)
    offer.status = OfferStatus.DECLINED
    offer.decided_at = utcnow()
    save(offer)

    notify(
        recipient_id=offer.offerer_id,
        type=NotificationType.OFFER_DECLINED,
        title="Offer declined",
        body=f"Your offer on \"{offer.trade.item_name}\" was declined.",
        trade_id=offer.trade_id,
        offer_id=offer.id,
    )
    return offer


def delete_offer(offer_id, caller_id):
    offer = get_offer_by_id(offer_id)
    if offer is None:
        raise NotFoundError("Offer not found.")
    if offer.offerer_id != caller_id:
        raise ForbiddenError("Only the offerer can delete this offer.")
    if offer.status != OfferStatus.PENDING:
        raise ConflictError("Only pending offers can be deleted.")

    repo_delete_offer(offer)


def list_by_trade(trade_id):
    return repo_list_by_trade(trade_id)


def list_sent(offerer_id):
    return repo_list_sent(offerer_id)


def list_received(owner_id):
    return repo_list_received(owner_id)
