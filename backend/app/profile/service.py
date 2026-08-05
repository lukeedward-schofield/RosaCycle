from datetime import timedelta

from flask import current_app

from app.auth.user_model import User
from app.profile.repository import (
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


def update_profile(user_id, *, updates, current_password, image_file):
    user = get_user_by_id(user_id)
    if user is None:
        raise NotFoundError("User not found.")

    info_fields = {"first_name", "last_name", "username", "email"}
    changing_info = any(k in updates for k in info_fields)
    changing_password = "password" in updates

    cooldown = timedelta(days=current_app.config["PROFILE_EDIT_COOLDOWN_DAYS"])

    if changing_info and user.info_updated_at is not None:
        next_allowed_at = ensure_aware(user.info_updated_at) + cooldown
        if utcnow() < next_allowed_at:
            days_left = (next_allowed_at - utcnow()).days + 1
            raise ConflictError(
                f"You can update your profile info again in {days_left} day(s)."
            )

    if changing_password and user.password_updated_at is not None:
        next_allowed_at = ensure_aware(user.password_updated_at) + cooldown
        if utcnow() < next_allowed_at:
            days_left = (next_allowed_at - utcnow()).days + 1
            raise ConflictError(
                f"You can change your password again in {days_left} day(s)."
            )

    if "password" in updates or "email" in updates or "username" in updates:
        if user.password_hash is not None:
            if not current_password or not verify_password(
                current_password, user.password_hash
            ):
                raise ForbiddenError("Current password is incorrect.")

    if "first_name" in updates:
        user.first_name = updates["first_name"]
    if "last_name" in updates:
        user.last_name = updates["last_name"]
    if "username" in updates:
        existing = get_user_by_username(updates["username"])
        if existing is not None and existing.id != user.id:
            raise ConflictError("An account with this username already exists.")
        user.username = updates["username"]
    if "email" in updates:
        existing = get_user_by_email(updates["email"])
        if existing is not None and existing.id != user.id:
            raise ConflictError("An account with this email already exists.")
        user.email = updates["email"]
    if "password" in updates:
        user.password_hash = hash_password(updates["password"])

    if image_file is not None:
        user.profile_image_path = save_image(image_file, "profiles")

    if changing_info:
        user.info_updated_at = utcnow()
    if changing_password:
        user.password_updated_at = utcnow()

    return save_user(user)
