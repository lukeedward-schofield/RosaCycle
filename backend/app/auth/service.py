import re
import secrets

from flask import current_app
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from app.auth.repository import (
    create_user,
    get_user_by_email,
    get_user_by_id,
    get_user_by_username,
    save_user,
)
from app.auth.user_model import User
from app.auth.utils import hash_password, verify_password
from app.shared.utils.errors import (
    ConflictError,
    NotFoundError,
    ValidationError,
)


def verify_google_token(token: str) -> dict:
    """Verify a Google ID token."""
    try:
        client_id = current_app.config["GOOGLE_CLIENT_ID"]

        return id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            audience=client_id,
        )
    except Exception as exc:
        raise ValidationError(
            f"Invalid Google token: {exc}",
            status_code=401,
        ) from exc


def _generate_unique_username(base: str) -> str:
    base = re.sub(r"[^a-zA-Z0-9_]", "", base).lower()

    if not base:
        base = "user"

    username = base
    counter = 1

    while get_user_by_username(username) is not None:
        username = f"{base}{counter}"
        counter += 1

    return username


def google_login_or_register(token: str):
    """
    Authenticate a user using a Google ID token.

    Returns:
        (user, is_new_user)
    """

    payload = verify_google_token(token)

    email = payload.get("email")
    google_id = payload.get("sub")

    if not email:
        raise ValidationError(
            "Google account has no email address.",
            status_code=401,
        )

    first_name = payload.get("given_name") or "Google"
    last_name = payload.get("family_name") or "User"
    picture = payload.get("picture")

    user = get_user_by_email(email)

    if user is not None:
        updated = False

        if getattr(user, "google_id", None) != google_id:
            user.google_id = google_id
            updated = True

        if picture and hasattr(user, "profile_image_path"):
            if user.profile_image_path != picture:
                user.profile_image_path = picture
                updated = True

        if updated:
            save_user(user)

        return user, False

    username = _generate_unique_username(email.split("@")[0])

    random_password = secrets.token_urlsafe(32)

    user = User(
        username=username,
        first_name=first_name,
        last_name=last_name,
        email=email,
        google_id=google_id,
        profile_image_path=picture,
        password_hash=hash_password(random_password),
    )

    user = create_user(user)

    return user, True


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
        raise ValidationError(
            "Invalid email or password.",
            status_code=401,
        )

    return user


def get_profile(user_id):
    user = get_user_by_id(user_id)

    if user is None:
        raise NotFoundError("User not found.")

    return user