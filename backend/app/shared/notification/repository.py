from app.shared.database import db
from app.shared.notification.model import Notification


def create_notification(notification):
    db.session.add(notification)
    db.session.commit()
    return notification


def list_for_user(user_id):
    return Notification.query.filter_by(recipient_id=user_id).order_by(Notification.created_at.desc()).all()


def count_unread(user_id):
    return Notification.query.filter_by(recipient_id=user_id, is_read=False).count()


def get_notification_by_id(notification_id):
    return db.session.get(Notification, notification_id)


def save_notification(notification):
    db.session.commit()
    return notification
