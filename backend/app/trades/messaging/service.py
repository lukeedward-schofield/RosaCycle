from flask import g

from app.shared.utils.mixins import utcnow

from app.auth.user_model import User
from app.trades.model import Trade
from app.trades.offer.model import Offer
from app.trades.messaging.model import Conversation, Message
from app.trades.messaging.repository import (
    create_conversation,
    create_message,
    get_conversation_by_id,
    get_conversation_by_offer,
    get_messages,
    save,
)
from app.shared.models.enums import OfferStatus
from app.shared.utils.errors import (
    ForbiddenError,
    NotFoundError,
)

def _is_participant(conversation, user_id):
    trade_owner = conversation.trade.owner_id
    offerer = conversation.offer.offerer_id

    return user_id in (trade_owner, offerer)

def get_conversation(conversation_id):
    conversation = get_conversation_by_id(conversation_id)

    if conversation is None:
        raise NotFoundError("Conversation not found.")

    if not _is_participant(conversation, g.current_user.id):
        raise ForbiddenError("You cannot access this conversation.")

    return conversation

def list_messages(conversation_id):
    conversation = get_conversation(conversation_id)
    return get_messages(conversation.id)

def send_message(conversation_id, content):
    conversation = get_conversation(conversation_id)

    message = Message(
        conversation_id=conversation.id,
        sender_id=g.current_user.id,
        content=content,
    )

    return create_message(message)

def mark_as_read(message):
    message.read_at = utcnow()
    save()
    return message

def create_conversation_if_needed(trade, offer):
    conversation = get_conversation_by_offer(offer.id)

    if conversation is not None:
        return conversation

    conversation = Conversation(
        trade_id=trade.id,
        offer_id=offer.id,
    )

    return create_conversation(conversation)