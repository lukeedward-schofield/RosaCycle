from flask import request

from app.shared.utils.errors import ValidationError
from app.trades.messaging.schema import (
    serialize_conversation,
    serialize_message,
)
from app.trades.messaging.service import (
    get_conversation,
    list_messages,
    send_message,
)

def get_conversation_by_id(conversation_id):
    conversation = get_conversation(conversation_id)

    return serialize_conversation(conversation), 200

def get_conversation_messages(conversation_id):
    messages = list_messages(conversation_id)

    return {
        "messages": [
            serialize_message(message)
            for message in messages
        ]
    }, 200

def create_message(conversation_id):
    body = request.get_json(silent=True) or {}

    if not body.get("content"):
        raise ValidationError("Content is required.")

    message = send_message(
        conversation_id,
        body["content"],
    )

    return serialize_message(message), 201