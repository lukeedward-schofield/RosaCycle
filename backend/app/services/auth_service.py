# backend/app/services/auth_service.py
from flask import current_app
from google.oauth2 import id_token
from google.auth.transport import requests

from app.shared.database import db
from app.auth.user_model import User
from app.shared.utils.errors import ValidationError


def verify_google_token(token: str) -> dict:
    """Verifies the ID token sent from frontend with Google's servers."""
    try:
        client_id = current_app.config.get("GOOGLE_CLIENT_ID")
        # If client_id is empty in dev, pass None or set up your Google Console Client ID
        id_info = id_token.verify_oauth2_token(
            token, requests.Request(), audience=client_id if client_id else None
        )
        return id_info
    except Exception as e:
        raise ValidationError(f"Invalid Google token: {str(e)}")


def google_login_or_register(id_token_str: str) -> User:
    """Authenticates a user via Google ID Token; creates a profile if new."""
    payload = verify_google_token(id_token_str)

    email = payload.get("email")
    google_id = payload.get("sub")
    first_name = payload.get("given_name", "Google")
    last_name = payload.get("family_name", "User")
    picture = payload.get("picture")

    if not email:
        raise ValidationError("Google account must have an email address.")

    # 1. Check if user exists by google_id or email
    user = User.query.filter(
        (User.google_id == google_id) | (User.email == email)
    ).first()

    if user:
        # Link google_id if not already linked
        if not user.google_id:
            user.google_id = google_id
            db.session.commit()
        return user

    # 2. Create new user if first-time login
    # Generate a unique base username from email
    base_username = email.split("@")[0]
    username = base_username
    counter = 1
    while User.query.filter_by(username=username).first():
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
    db.session.add(new_user)
    db.session.commit()

    return new_user
