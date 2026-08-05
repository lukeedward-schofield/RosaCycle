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
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests


def verify_google_token(token: str) -> dict:
    """Verifies the ID token sent from frontend with Google's servers."""
    try:
        client_id = current_app.config.get("GOOGLE_CLIENT_ID")
        id_info = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            audience=client_id if client_id else None,
        )
        return id_info
    except Exception as e:
        raise ValidationError(f"Invalid Google token: {str(e)}")


def google_login_or_register(id_token_str: str) -> tuple[User, bool]:
    """Authenticates a user via Google ID Token; creates a profile if new.
    Returns (user, is_new_user)."""
    payload = verify_google_token(id_token_str)

    email = payload.get("email")
    google_id = payload.get("sub")
    first_name = payload.get("given_name", "Google")
    last_name = payload.get("family_name", "User")
    picture = payload.get("picture")

    if not email:
        raise ValidationError("Google account must have an email address.")

    user = User.query.filter(
        (User.google_id == google_id) | (User.email == email)
    ).first()

    if user:
        if not user.google_id:
            user.google_id = google_id
            save_user(user)
        return user, False

    base_username = email.split("@")[0]
    username = base_username
    counter = 1
    while get_user_by_username(username) is not None:
        username = f"{base_username}{counter}"
        counter += 1

    new_user = User(
        username=username,
        first_name=first_name,
        last_name=last_name,
        email=email,
        google_id=google_id,
        profile_image_path=picture,
    )
    return create_user(new_user), True


def verify_google_token(token: str) -> dict:
    """Verifies the ID token sent from the frontend against Google's servers."""
    try:
        client_id = current_app.config.get("GOOGLE_CLIENT_ID")
        id_info = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            audience=client_id if client_id else None,
        )
        return id_info
    except Exception as e:
        raise ValidationError(f"Invalid Google token: {str(e)}")


def google_login_or_register(id_token_str: str) -> tuple[User, bool]:
    """Authenticates a user via Google ID Token; creates a profile if new.
    Returns (user, is_new_user)."""
    payload = verify_google_token(id_token_str)

    email = payload.get("email")
    google_id = payload.get("sub")
    first_name = payload.get("given_name", "Google")
    last_name = payload.get("family_name", "User")
    picture = payload.get("picture")

    if not email:
        raise ValidationError("Google account must have an email address.")

    user = User.query.filter(
        (User.google_id == google_id) | (User.email == email)
    ).first()

    if user:
        if not user.google_id:
            user.google_id = google_id
            save_user(user)
        return user, False

    base_username = email.split("@")[0]
    username = base_username
    counter = 1
    while get_user_by_username(username) is not None:
        username = f"{base_username}{counter}"
        counter += 1

    new_user = User(
        username=username,
        first_name=first_name,
        last_name=last_name,
        email=email,
        google_id=google_id,
        profile_image_path=picture,
    )
    return create_user(new_user), True

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
