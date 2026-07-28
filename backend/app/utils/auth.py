from functools import wraps

from flask import g
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from werkzeug.security import check_password_hash, generate_password_hash

from app.utils.errors import ApiError


def hash_password(raw_password):
    return generate_password_hash(raw_password)


def verify_password(raw_password, password_hash):
    return check_password_hash(password_hash, raw_password)


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        from app.repositories.user_repository import get_user_by_id

        user = get_user_by_id(get_jwt_identity())
        if user is None:
            raise ApiError("User not found.", 401)
        g.current_user = user
        return fn(*args, **kwargs)

    return wrapper
