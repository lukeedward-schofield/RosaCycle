from flask import Blueprint
from app.controller import auth_controller

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.post("/register")
def register():
    return auth_controller.register()

@auth_bp.post("/login")
def login():
    return auth_controller.login()

@auth_bp.post("/logout")
def logout():
    return auth_controller.logout()

@auth_bp.post("/google")
def google_login():
    return auth_controller.google_login()