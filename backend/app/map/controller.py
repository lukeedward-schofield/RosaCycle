from flask import g, request

from app.map.schema import serialize_resource_spot
from app.map.service import (
    add_photo_update,
    get_spot,
    list_active,
    mark_collected as mark_collected_service,
    report_spot,
)


def list_spots():
    spots = list_active()
    return [serialize_resource_spot(s) for s in spots], 200


def get_spot_by_id(spot_id):
    spot = get_spot(spot_id)
    return serialize_resource_spot(spot), 200


def create_spot():
    spot = report_spot(
        g.current_user.id,
        fields=request.form,
        image_file=request.files.get("image"),
    )
    return serialize_resource_spot(spot), 201


def update_spot_photo(spot_id):
    spot = add_photo_update(spot_id, image_file=request.files.get("image"))
    return serialize_resource_spot(spot), 200


def mark_collected(spot_id):
    spot = mark_collected_service(spot_id)
    return serialize_resource_spot(spot), 200
