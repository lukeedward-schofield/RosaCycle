from decimal import Decimal, InvalidOperation

from flask import current_app

from app.shared.models.enums import ResourceSpotStatus
from app.map.model import ResourceSpot
from app.map.repository import (
    create_spot,
    delete_spot as repo_delete_spot,
    get_spot_by_id,
    list_active as repo_list_active,
    save_spot,
)
from app.shared.utils.errors import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
)
from app.shared.utils.file_storage import save_image
from app.shared.utils.mixins import utcnow

REQUIRED_FIELDS = ("name", "material", "locationText")


def report_spot(reporter_id, *, fields, image_file):
    missing = [field for field in REQUIRED_FIELDS if not fields.get(field)]
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
        expires_at=ResourceSpot.default_expiry(
            current_app.config["RESOURCE_SPOT_EXPIRY_DAYS"]
        ),
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


def _require_owner(spot, user_id):
    if spot.reporter_id != user_id:
        raise ForbiddenError("You can only modify your own resource spots.")


def _parse_optional_weight(value):
    if value in (None, ""):
        return None
    try:
        parsed = Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise ValidationError("Weight must be a valid number.")
    if parsed < 0:
        raise ValidationError("Weight cannot be negative.")
    return parsed


def _parse_optional_quantity(value):
    if value in (None, ""):
        return None
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        raise ValidationError("Quantity must be a whole number.")
    if isinstance(value, str) and str(parsed) != value.strip():
        raise ValidationError("Quantity must be a whole number.")
    if parsed < 0:
        raise ValidationError("Quantity cannot be negative.")
    return parsed


def update_spot(reporter_id, spot_id, *, fields):
    spot = get_spot(spot_id)
    _require_owner(spot, reporter_id)

    if spot.status != ResourceSpotStatus.ACTIVE:
        raise ConflictError("This resource spot is no longer active.")

    missing = [
        field for field in REQUIRED_FIELDS if not str(fields.get(field, "")).strip()
    ]
    if missing:
        raise ValidationError(f"Missing required field(s): {', '.join(missing)}.")

    spot.name = str(fields["name"]).strip()
    spot.material = str(fields["material"]).strip()
    spot.weight_kg = _parse_optional_weight(fields.get("weightKg"))
    spot.quantity = _parse_optional_quantity(fields.get("quantity"))
    spot.description = str(fields.get("description") or "").strip() or None
    spot.location_text = str(fields["locationText"]).strip()
    spot.permission_note = str(fields.get("permissionNote") or "").strip() or None

    return save_spot(spot)


def add_photo_update(reporter_id, spot_id, *, image_file):
    spot = get_spot(spot_id)
    _require_owner(spot, reporter_id)

    if spot.status != ResourceSpotStatus.ACTIVE:
        raise ConflictError("This resource spot is no longer active.")
    if image_file is None:
        raise ValidationError("An updated photo is required.")

    spot.image_path = save_image(image_file, "resource_spots")
    return save_spot(spot)


def delete_spot(reporter_id, spot_id):
    spot = get_spot(spot_id)
    _require_owner(spot, reporter_id)
    repo_delete_spot(spot)


def mark_collected(reporter_id, spot_id):
    spot = get_spot(spot_id)
    _require_owner(spot, reporter_id)

    if spot.status == ResourceSpotStatus.COLLECTED:
        raise ConflictError("This resource spot is already marked collected.")

    spot.status = ResourceSpotStatus.COLLECTED
    spot.collected_at = utcnow()
    return save_spot(spot)
