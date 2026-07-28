from flask import Blueprint

from app.controller import notification_controller
from app.utils.auth import require_auth

notification_bp = Blueprint("notification", __name__, url_prefix="/notifications")


@notification_bp.get("")
@require_auth
def list_notifications():
    return notification_controller.list_notifications()


@notification_bp.get("/unread-count")
@require_auth
def unread_notification_count():
    return notification_controller.unread_notification_count()


@notification_bp.patch("/<notification_id>/read")
@require_auth
def mark_notification_read(notification_id):
    return notification_controller.mark_notification_read(notification_id)
