from flask import request
from flask_jwt_extended import create_access_token

from app.auth.schema import serialize_user
from app.auth.service import authenticate_user, register_user
from app.services.auth_service import google_login_or_register
from app.utils.errors import ValidationError


def register():
    
    body = request.get_json(silent=True) or {}
    required = ("username", "firstName", "lastName", "email", "password")
    missing = [field for field in required if not body.get(field)]
    if missing:
        raise ValidationError(f"Missing required field(s): {', '.join(missing)}.")

    user = register_user(
        username=body["username"],
        first_name=body["firstName"],
        last_name=body["lastName"],
        email=body["email"],
        password=body["password"],
    )
    token = create_access_token(identity=user.id)
    return {"token": token, "user": serialize_user(user)}, 201


def login():
    body = request.get_json(silent=True) or {}
    if not body.get("email") or not body.get("password"):
        raise ValidationError("Email and password are required.")

    user = authenticate_user(email=body["email"], password=body["password"])
    token = create_access_token(identity=user.id)
    return {"token": token, "user": serialize_user(user)}, 200


def logout():
    return {"success": True}, 200

def google_login():
    body = request.get_json(silent=True) or {}
    token = body.get("token")  # Frontend sends Google ID Token here
    if not token:
        raise ValidationError("Google token is required.")

    user = google_login_or_register(token)
    access_token = create_access_token(identity=str(user.id))
    
    return {"token": access_token, "user": serialize_user(user)}, 200