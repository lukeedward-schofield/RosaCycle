from flask import g, request

from app.map.schema import serialize_resource_spot
from app.map.service import (
    add_photo_update,
    delete_spot as delete_spot_service,
    get_spot,
    list_active,
    mark_collected as mark_collected_service,
    report_spot,
    update_spot as update_spot_service,
)


def list_spots():
    spots = list_active()
    return [serialize_resource_spot(spot) for spot in spots], 200


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


def update_spot(spot_id):
    spot = update_spot_service(
        g.current_user.id,
        spot_id,
        fields=request.get_json(silent=True) or {},
    )
    return serialize_resource_spot(spot), 200


def update_spot_photo(spot_id):
    spot = add_photo_update(
        g.current_user.id,
        spot_id,
        image_file=request.files.get("image"),
    )
    return serialize_resource_spot(spot), 200


def delete_spot(spot_id):
    delete_spot_service(g.current_user.id, spot_id)
    return "", 204


def mark_collected(spot_id):
    spot = mark_collected_service(g.current_user.id, spot_id)
    return serialize_resource_spot(spot), 200
