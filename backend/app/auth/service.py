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
import re
import secrets
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token


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


def _verify_google_token(token):
    """Verifies the Google ID token against our configured Client ID."""
    client_id = current_app.config.get("GOOGLE_CLIENT_ID")
    try:
        id_info = google_id_token.verify_oauth2_token(
            token, google_requests.Request(), audience=client_id
        )
    except ValueError as exc:
        raise ValidationError("Invalid Google token.", status_code=401) from exc
    return id_info


def _generate_unique_username(base):
    base = re.sub(r"[^a-zA-Z0-9_]", "", base).lower() or "user"
    base = base[:40] or "user"
    candidate = base
    suffix = 0
    while get_user_by_username(candidate) is not None:
        suffix += 1
        candidate = f"{base}{suffix}"
    return candidate


def google_login_or_register(token):
    """Verifies a Google ID token, then logs the user in or auto-registers them.

    Google-registered accounts get an unusable random password hash (they never
    log in with a password, only via Google) so the existing NOT NULL constraint
    on password_hash doesn't need a migration.
    """
    id_info = _verify_google_token(token)
    email = id_info.get("email")
    if not email:
        raise ValidationError("Google account has no email associated.", status_code=401)

    user = get_user_by_email(email)
    if user is not None:
        return user

    username = _generate_unique_username(email.split("@")[0])
    unusable_password = secrets.token_urlsafe(32)

    user = User(
        username=username,
        first_name=id_info.get("given_name") or "Google",
        last_name=id_info.get("family_name") or "User",
        email=email,
        password_hash=hash_password(unusable_password),
    )
    return create_user(user)
