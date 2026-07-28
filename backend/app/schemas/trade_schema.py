from app.utils.file_storage import build_media_url


def serialize_trade(trade):
    return {
        "id": trade.id,
        "name": trade.item_name,
        "category": trade.category,
        "material": trade.material,
        "image": build_media_url(trade.image_path),
        "location": trade.location_text,
        "pickupLocation": trade.pickup_location_text,
        "posterName": trade.owner.first_name,
        "posterId": trade.owner_id,
        "weightKg": float(trade.weight_kg) if trade.weight_kg is not None else None,
        "quantity": trade.quantity,
        "tradingFor": {
            "type": trade.trading_for_type.value,
            "value": trade.trading_for_value,
        },
        "description": trade.description,
        "status": trade.status.value,
        "hasOffers": trade.has_offers,
        "offerAccepted": trade.offer_accepted,
        "createdAt": trade.created_at.isoformat(),
    }
