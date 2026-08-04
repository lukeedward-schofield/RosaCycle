from app.shared.utils.file_storage import build_media_url


def serialize_offer(offer):
    return {
        "id": offer.id,
        "tradeId": offer.trade_id,
        "tradeName": offer.trade.item_name,
        "offererId": offer.offerer_id,
        "offererName": offer.offerer.first_name,
        "itemName": offer.item_name,
        "category": offer.category,
        "material": offer.material,
        "weightKg": float(offer.weight_kg) if offer.weight_kg is not None else None,
        "description": offer.description,
        "image": build_media_url(offer.image_path),
        "status": offer.status.value,
        "createdAt": offer.created_at.isoformat(),
        "decidedAt": offer.decided_at.isoformat() if offer.decided_at else None,
    }
