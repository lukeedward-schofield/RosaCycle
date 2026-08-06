from flask import g, request

from app.schemas.user_schema import serialize_user
from app.services.user_service import update_profile


def get_me():
    return serialize_user(g.current_user), 200


def update_me():
    form = request.form
    updates = {}
    for form_key, field in (
        ("firstName", "first_name"),
        ("lastName", "last_name"),
        ("username", "username"),
        ("email", "email"),
        ("password", "password"),
    ):
        if form_key in form:
            value = form[form_key].strip()
            if value:
                updates[field] = value

    current_password = form.get("currentPassword")
    image_file = request.files.get("image")

    user = update_profile(
        g.current_user.id,
        updates=updates,
        current_password=current_password,
        image_file=image_file,
    )
    return serialize_user(user), 200
