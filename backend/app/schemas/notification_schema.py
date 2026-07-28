def serialize_notification(notification):
    return {
        "id": notification.id,
        "type": notification.type.value,
        "title": notification.title,
        "body": notification.body,
        "relatedTradeId": notification.related_trade_id,
        "relatedOfferId": notification.related_offer_id,
        "isRead": notification.is_read,
        "createdAt": notification.created_at.isoformat(),
    }
