from flask import current_app

from app.models.enums import ResourceSpotStatus
from app.models.resource_spot import ResourceSpot
from app.repositories.resource_spot_repository import (
    create_spot,
    get_spot_by_id,
    list_active as repo_list_active,
    save_spot,
)
from app.utils.errors import ConflictError, NotFoundError, ValidationError
from app.utils.file_storage import save_image
from app.utils.mixins import utcnow

REQUIRED_FIELDS = ("name", "material", "locationText")


def report_spot(reporter_id, *, fields, image_file):
    missing = [f for f in REQUIRED_FIELDS if not fields.get(f)]
    if missing:
        raise ValidationError(f"Missing required field(s): {', '.join(missing)}.")

    spot = ResourceSpot(
        reporter_id=reporter_id,
        name=fields["name"],
        material=fields["material"],
        weight_kg=fields.get("weightKg"),
        quantity=fields.get("quantity"),
        description=fields.get("description"),
        location_text=fields["locationText"],
        permission_note=fields.get("permissionNote"),
        status=ResourceSpotStatus.ACTIVE,
        expires_at=ResourceSpot.default_expiry(current_app.config["RESOURCE_SPOT_EXPIRY_DAYS"]),
    )
    if image_file is not None:
        spot.image_path = save_image(image_file, "resource_spots")

    return create_spot(spot)


def get_spot(spot_id):
    spot = get_spot_by_id(spot_id)
    if spot is None:
        raise NotFoundError("Resource spot not found.")
    return spot


def list_active():
    return repo_list_active()


def add_photo_update(spot_id, *, image_file):
    spot = get_spot(spot_id)
    if spot.status != ResourceSpotStatus.ACTIVE:
        raise ConflictError("This resource spot is no longer active.")
    if image_file is None:
        raise ValidationError("An updated photo is required.")

    spot.image_path = save_image(image_file, "resource_spots")
    return save_spot(spot)


def mark_collected(spot_id):
    spot = get_spot(spot_id)
    if spot.status == ResourceSpotStatus.COLLECTED:
        raise ConflictError("This resource spot is already marked collected.")

    spot.status = ResourceSpotStatus.COLLECTED
    spot.collected_at = utcnow()
    return save_spot(spot)
