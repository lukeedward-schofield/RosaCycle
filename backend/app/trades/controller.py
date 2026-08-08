from flask import g, request

from app.trades.schema import serialize_trade
from app.trades.service import (
    create_trade as create_trade_service,
    get_trade as get_trade_service,
    list_browse,
    list_mine,
    update_trade as update_trade_service,
    delete_trade as delete_trade_service
)
from app.trades.ai_service import assess_trade_photo

def assess_trade():
    image = request.files.get("image")

    if image is None:
        return {
            "success": False,
            "error": "Image is required."
        }, 400

    result = assess_trade_photo(image)

    status = 200 if result["success"] else 400

    return result, status


def browse_trades():
    category = request.args.get("category")
    location = request.args.get("location")
    trades = list_browse(g.current_user.id, category=category, location=location)
    return [serialize_trade(t) for t in trades], 200


def my_trades():
    trades = list_mine(g.current_user.id)
    return [serialize_trade(t) for t in trades], 200


def get_trade(trade_id):
    trade = get_trade_service(trade_id)
    return serialize_trade(trade), 200


def create_trade():
    trade = create_trade_service(
        g.current_user.id,
        fields=request.form,
        image_file=request.files.get("image"),
    )
    return serialize_trade(trade), 201


def update_trade(trade_id):
    trade = update_trade_service(
        trade_id,
        g.current_user.id,
        fields=request.form,
        image_file=request.files.get("image"),
    )
    return serialize_trade(trade), 200

def delete_trade(trade_id):
    trade = delete_trade_service(
        trade_id,
        g.current_user.id,
    )

    return {
        "success": True,
        "message": "Trade deleted successfully.",
    }, 200
