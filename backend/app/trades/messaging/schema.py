from app.auth.schema import serialize_user


def serialize_message(message, current_user_id=None):
    return {
        "id": message.id,
        "sender": serialize_user(message.sender),
        "content": message.content,
        "createdAt": message.created_at.isoformat(),
        "readAt": (
            message.read_at.isoformat()
            if message.read_at
            else None
        ),
        "fromMe": message.sender_id == current_user_id,
    }


def serialize_conversation(conversation):
    return {
        "id": conversation.id,
        "tradeId": conversation.trade_id,
        "offerId": conversation.offer_id,
        "createdAt": conversation.created_at.isoformat(),
    }