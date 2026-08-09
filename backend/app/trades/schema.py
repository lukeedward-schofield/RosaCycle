from datetime import timedelta

from app.shared.utils.file_storage import build_media_url


AUTO_COMPLETE_AFTER = timedelta(days=3)


def serialize_trade(trade):
    accepted_offer = trade.accepted_offer
    auto_complete_at = (
        trade.completion_requested_at + AUTO_COMPLETE_AFTER
        if trade.completion_requested_at is not None
        else None
    )

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
        "offerAccepted": accepted_offer is not None,
        "acceptedOffererId": accepted_offer.offerer_id if accepted_offer is not None else None,
        "acceptedOffererName": accepted_offer.offerer.first_name if accepted_offer is not None else None,
        "completion": {
            "requestedAt": (
                trade.completion_requested_at.isoformat()
                if trade.completion_requested_at is not None
                else None
            ),
            "autoCompleteAt": auto_complete_at.isoformat() if auto_complete_at is not None else None,
            "completedAt": trade.completed_at.isoformat() if trade.completed_at is not None else None,
        },
        "conversationId": (
            trade.conversation.id
            if trade.conversation is not None
            else None
        ),
        "createdAt": trade.created_at.isoformat(),
    }
