from flask import Blueprint
from app.auth import controller

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.post("/register")
def register():
    return controller.register()

@auth_bp.post("/login")
def login():
    return controller.login()

@auth_bp.post("/logout")
def logout():
    return controller.logout()

@auth_bp.post("/google")
def google_login():
    return controller.google_login()