from app.utils.file_storage import build_media_url


def serialize_resource_spot(spot):
    return {
        "id": spot.id,
        "name": spot.name,
        "material": spot.material,
        "weightKg": float(spot.weight_kg) if spot.weight_kg is not None else None,
        "quantity": spot.quantity,
        "description": spot.description,
        "location": spot.location_text,
        "permissionNote": spot.permission_note,
        "image": build_media_url(spot.image_path),
        "status": spot.status.value,
        "reporterId": spot.reporter_id,
        "reporterName": spot.reporter.first_name,
        "createdAt": spot.created_at.isoformat(),
        "expiresAt": spot.expires_at.isoformat(),
    }
