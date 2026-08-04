from flask import g, request

from app.trades.offer.schema import serialize_offer
from app.trades.offer.service import (
    accept_offer as accept_offer_service,
    decline_offer as decline_offer_service,
    list_by_trade,
    list_received,
    list_sent,
    send_offer as send_offer_service,
)


def send_offer(trade_id):
    offer = send_offer_service(
        trade_id,
        g.current_user.id,
        fields=request.form,
        image_file=request.files.get("image"),
    )
    return serialize_offer(offer), 201


def offers_for_trade(trade_id):
    offers = list_by_trade(trade_id)
    return [serialize_offer(o) for o in offers], 200


def accept_offer(offer_id):
    offer = accept_offer_service(offer_id, g.current_user.id)
    return serialize_offer(offer), 200


def decline_offer(offer_id):
    offer = decline_offer_service(offer_id, g.current_user.id)
    return serialize_offer(offer), 200


def my_sent_offers():
    offers = list_sent(g.current_user.id)
    return [serialize_offer(o) for o in offers], 200


def my_received_offers():
    offers = list_received(g.current_user.id)
    return [serialize_offer(o) for o in offers], 200
