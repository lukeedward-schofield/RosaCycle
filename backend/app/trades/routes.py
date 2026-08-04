from flask import Blueprint

from app.trades import controller as trade_controller
from app.auth.utils import require_auth

trade_bp = Blueprint("trade", __name__, url_prefix="/trades")


@trade_bp.get("")
@require_auth
def browse_trades():
    return trade_controller.browse_trades()


@trade_bp.get("/mine")
@require_auth
def my_trades():
    return trade_controller.my_trades()


@trade_bp.get("/<trade_id>")
@require_auth
def get_trade(trade_id):
    return trade_controller.get_trade(trade_id)


@trade_bp.post("")
@require_auth
def create_trade():
    return trade_controller.create_trade()


@trade_bp.patch("/<trade_id>")
@require_auth
def update_trade(trade_id):
    return trade_controller.update_trade(trade_id)
