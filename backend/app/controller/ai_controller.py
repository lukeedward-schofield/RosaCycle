from flask import request

from app.services.ai_service import assess_resource_spot_photo, assess_trade_photo
from app.utils.errors import ValidationError


def assess_trade():
    image_file = request.files.get("image")
    if image_file is None:
        raise ValidationError("An image file is required.")
    return assess_trade_photo(image_file), 200


def assess_resource_spot():
    image_file = request.files.get("image")
    if image_file is None:
        raise ValidationError("An image file is required.")
    return assess_resource_spot_photo(image_file), 200
