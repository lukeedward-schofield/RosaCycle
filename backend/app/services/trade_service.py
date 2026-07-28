from app.models.enums import TradeStatus, TradingForType
from app.models.trade import Trade
from app.repositories.trade_repository import (
    create_trade as create_trade_row,
    get_trade_by_id,
    list_browse as repo_list_browse,
    list_mine as repo_list_mine,
    save_trade,
)
from app.utils.errors import ForbiddenError, NotFoundError, ValidationError
from app.utils.file_storage import save_image

VALID_TRADING_FOR_TYPES = {t.value for t in TradingForType}


def create_trade(owner_id, *, fields, image_file):
    trading_for_type = fields.get("tradingForType")
    if trading_for_type not in VALID_TRADING_FOR_TYPES:
        raise ValidationError("tradingForType must be one of: specific, nothing, negotiating.")

    required = ("itemName", "category", "material", "locationText", "quantity")
    missing = [f for f in required if not fields.get(f)]
    if missing:
        raise ValidationError(f"Missing required field(s): {', '.join(missing)}.")

    trade = Trade(
        owner_id=owner_id,
        item_name=fields["itemName"],
        category=fields["category"],
        material=fields["material"],
        description=fields.get("description"),
        weight_kg=fields.get("weightKg"),
        quantity=int(fields["quantity"]),
        location_text=fields["locationText"],
        pickup_location_text=fields.get("pickupLocationText"),
        trading_for_type=TradingForType(trading_for_type),
        trading_for_value=fields.get("tradingForValue"),
        status=TradeStatus.OPEN,
    )
    if image_file is not None:
        trade.image_path = save_image(image_file, "trades")

    return create_trade_row(trade)


def get_trade(trade_id):
    trade = get_trade_by_id(trade_id)
    if trade is None:
        raise NotFoundError("Trade not found.")
    return trade


def update_trade(trade_id, owner_id, *, fields, image_file):
    trade = get_trade(trade_id)
    if trade.owner_id != owner_id:
        raise ForbiddenError("Only the trade owner can edit this trade.")

    for form_field, attr in (
        ("itemName", "item_name"),
        ("category", "category"),
        ("material", "material"),
        ("description", "description"),
        ("weightKg", "weight_kg"),
        ("locationText", "location_text"),
        ("pickupLocationText", "pickup_location_text"),
        ("tradingForValue", "trading_for_value"),
    ):
        if form_field in fields:
            setattr(trade, attr, fields[form_field])

    if "quantity" in fields:
        trade.quantity = int(fields["quantity"])
    if "tradingForType" in fields:
        if fields["tradingForType"] not in VALID_TRADING_FOR_TYPES:
            raise ValidationError("tradingForType must be one of: specific, nothing, negotiating.")
        trade.trading_for_type = TradingForType(fields["tradingForType"])
    if image_file is not None:
        trade.image_path = save_image(image_file, "trades")

    return save_trade(trade)


def list_browse(current_user_id, *, category=None, location=None):
    return repo_list_browse(exclude_owner_id=current_user_id, category=category, location=location).all()


def list_mine(owner_id):
    return repo_list_mine(owner_id).all()
