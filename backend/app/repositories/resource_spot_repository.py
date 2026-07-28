from app.database import db
from app.models.enums import ResourceSpotStatus
from app.models.resource_spot import ResourceSpot
from app.utils.mixins import utcnow


def get_spot_by_id(spot_id):
    return db.session.get(ResourceSpot, spot_id)


def list_active():
    return (
        ResourceSpot.query.filter(
            ResourceSpot.status == ResourceSpotStatus.ACTIVE,
            ResourceSpot.expires_at > utcnow(),
        )
        .order_by(ResourceSpot.created_at.desc())
        .all()
    )


def create_spot(spot):
    db.session.add(spot)
    db.session.commit()
    return spot


def save_spot(spot):
    db.session.commit()
    return spot
