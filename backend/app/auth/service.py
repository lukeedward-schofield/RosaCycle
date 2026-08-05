from datetime import timedelta

from flask import current_app

from app.auth.user_model import User
from app.auth.repository import (
    create_user,
    get_user_by_email,
    get_user_by_id,
    get_user_by_username,
    save_user,
)
from app.auth.utils import hash_password, verify_password
from app.shared.utils.errors import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
)
from app.shared.utils.file_storage import save_image
from app.shared.utils.mixins import ensure_aware, utcnow


def register_user(*, username, first_name, last_name, email, password):
    if get_user_by_email(email) is not None:
        raise ConflictError("An account with this email already exists.")
    if get_user_by_username(username) is not None:
        raise ConflictError("An account with this username already exists.")

    user = User(
        username=username,
        first_name=first_name,
        last_name=last_name,
        email=email,
        password_hash=hash_password(password),
    )
    return create_user(user)


def authenticate_user(*, email, password):
    user = get_user_by_email(email)
    if user is None or not verify_password(password, user.password_hash):
        raise ValidationError("Invalid email or password.", status_code=401)
    return user


def get_profile(user_id):
    user = get_user_by_id(user_id)
    if user is None:
        raise NotFoundError("User not found.")
    return user
