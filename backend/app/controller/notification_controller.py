from flask import g

from app.schemas.notification_schema import serialize_notification
from app.services.notification_service import list_for_user, mark_read, unread_count


def list_notifications():
    notifications = list_for_user(g.current_user.id)
    return [serialize_notification(n) for n in notifications], 200


def unread_notification_count():
    return {"count": unread_count(g.current_user.id)}, 200


def mark_notification_read(notification_id):
    notification = mark_read(notification_id, g.current_user.id)
    return serialize_notification(notification), 200
