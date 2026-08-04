from flask import Blueprint

from app.profile import controller as user_controller
from app.auth.utils import require_auth

user_bp = Blueprint("user", __name__, url_prefix="/users")


@user_bp.get("/me")
@require_auth
def get_me():
    return user_controller.get_me()


@user_bp.patch("/me")
@require_auth
def update_me():
    return user_controller.update_me()
