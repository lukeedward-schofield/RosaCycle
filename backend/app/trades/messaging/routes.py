from flask import Blueprint

from app.auth.utils import require_auth
from app.trades.messaging import controller

messaging_bp = Blueprint(
    "messaging",
    __name__,
    url_prefix="/messages",
)


@messaging_bp.get("/<conversation_id>")
@require_auth
def get_conversation(conversation_id):
    return controller.get_conversation_by_id(conversation_id)


@messaging_bp.get("/<conversation_id>/messages")
@require_auth
def get_messages(conversation_id):
    return controller.get_conversation_messages(conversation_id)


@messaging_bp.post("/<conversation_id>/messages")
@require_auth
def create_message(conversation_id):
    return controller.create_message(conversation_id)