from flask import Blueprint

from app.trades.offer import controller as offer_controller
from app.auth.utils import require_auth

offer_bp = Blueprint("offer", __name__)


@offer_bp.post("/trades/<trade_id>/offers")
@require_auth
def send_offer(trade_id):
    return offer_controller.send_offer(trade_id)


@offer_bp.get("/trades/<trade_id>/offers")
@require_auth
def offers_for_trade(trade_id):
    return offer_controller.offers_for_trade(trade_id)


@offer_bp.post("/offers/<offer_id>/accept")
@require_auth
def accept_offer(offer_id):
    return offer_controller.accept_offer(offer_id)


@offer_bp.post("/offers/<offer_id>/decline")
@require_auth
def decline_offer(offer_id):
    return offer_controller.decline_offer(offer_id)


@offer_bp.get("/offers/mine")
@require_auth
def my_sent_offers():
    return offer_controller.my_sent_offers()


@offer_bp.get("/offers/received")
@require_auth
def my_received_offers():
    return offer_controller.my_received_offers()
