from flask import Blueprint

from app.map import controller as resource_spot_controller
from app.auth.utils import require_auth

resource_spot_bp = Blueprint("resource_spot", __name__, url_prefix="/resource-spots")


@resource_spot_bp.get("")
@require_auth
def list_spots():
    return resource_spot_controller.list_spots()


@resource_spot_bp.get("/<spot_id>")
@require_auth
def get_spot(spot_id):
    return resource_spot_controller.get_spot_by_id(spot_id)


@resource_spot_bp.post("")
@require_auth
def create_spot():
    return resource_spot_controller.create_spot()


@resource_spot_bp.post("/<spot_id>/photos")
@require_auth
def update_spot_photo(spot_id):
    return resource_spot_controller.update_spot_photo(spot_id)


@resource_spot_bp.post("/<spot_id>/collected")
@require_auth
def mark_collected(spot_id):
    return resource_spot_controller.mark_collected(spot_id)
