from app.shared.database import db
from app.trades.messaging.model import Conversation, Message


def create_conversation(conversation):
    db.session.add(conversation)
    db.session.commit()
    return conversation


def get_conversation_by_id(conversation_id):
    return db.session.get(Conversation, conversation_id)


def get_conversation_by_trade(trade_id):
    return Conversation.query.filter_by(trade_id=trade_id).first()


def get_conversation_by_offer(offer_id):
    return Conversation.query.filter_by(offer_id=offer_id).first()


def create_message(message):
    db.session.add(message)
    db.session.commit()
    return message


def get_messages(conversation_id):
    return (
        Message.query.filter_by(conversation_id=conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )


def save():
    db.session.commit()