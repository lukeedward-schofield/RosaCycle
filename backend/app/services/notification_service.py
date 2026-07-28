from app.models.notification import Notification
from app.repositories.notification_repository import (
    count_unread,
    create_notification as create_notification_row,
    get_notification_by_id,
    list_for_user as repo_list_for_user,
    save_notification,
)
from app.utils.errors import ForbiddenError, NotFoundError


def notify(*, recipient_id, type, title, body, trade_id=None, offer_id=None):
    notification = Notification(
        recipient_id=recipient_id,
        type=type,
        title=title,
        body=body,
        related_trade_id=trade_id,
        related_offer_id=offer_id,
    )
    return create_notification_row(notification)


def list_for_user(user_id):
    return repo_list_for_user(user_id)


def unread_count(user_id):
    return count_unread(user_id)


def mark_read(notification_id, user_id):
    notification = get_notification_by_id(notification_id)
    if notification is None:
        raise NotFoundError("Notification not found.")
    if notification.recipient_id != user_id:
        raise ForbiddenError("You cannot modify another user's notification.")
    notification.is_read = True
    return save_notification(notification)
