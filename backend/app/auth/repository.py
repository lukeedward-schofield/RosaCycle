from app.shared.database import db
from app.auth.user_model import User


def get_user_by_id(user_id):
    return db.session.get(User, user_id)


def get_user_by_email(email):
    return User.query.filter(db.func.lower(User.email) == email.lower()).first()


def get_user_by_username(username):
    return User.query.filter(db.func.lower(User.username) == username.lower()).first()


def create_user(user):
    db.session.add(user)
    db.session.commit()
    return user


def save_user(user):
    db.session.commit()
    return user
