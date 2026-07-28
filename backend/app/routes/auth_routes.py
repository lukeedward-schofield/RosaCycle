from flask import Blueprint

from app.controller import auth_controller
from app.utils.rate_limit import limiter

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.post("/register")
@limiter.limit("10 per hour")
def register():
    return auth_controller.register()


@auth_bp.post("/login")
@limiter.limit("20 per hour")
def login():
    return auth_controller.login()


@auth_bp.post("/logout")
def logout():
    return auth_controller.logout()
