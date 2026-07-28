"""Populates the database with demo data for local development/demos.

Usage: python seed.py
Safe to re-run: skips seeding if any users already exist.
"""
from dotenv import load_dotenv

load_dotenv()

from app.app import create_app  # noqa: E402
from app.database import db  # noqa: E402
from app.models.enums import ResourceSpotStatus, TradeStatus, TradingForType  # noqa: E402
from app.models.resource_spot import ResourceSpot  # noqa: E402
from app.models.trade import Trade  # noqa: E402
from app.models.user import User  # noqa: E402
from app.utils.auth import hash_password  # noqa: E402

DEMO_USERS = [
    {"username": "luke", "first_name": "Luke", "last_name": "S", "email": "luke@example.com"},
    {"username": "aero", "first_name": "Aero", "last_name": "T", "email": "aero@example.com"},
    {"username": "franz", "first_name": "Franz", "last_name": "M", "email": "franz@example.com"},
]
DEMO_PASSWORD = "password123"

DEMO_TRADES = [
    {
        "item_name": "Old Woods", "category": "Wood", "material": "Reclaimed lumber",
        "description": "Still good, open for swap: paper or old magazines.",
        "weight_kg": 4.5, "quantity": 1, "location_text": "Balibago, Santa Rosa, Laguna",
        "trading_for_type": TradingForType.SPECIFIC, "trading_for_value": "Paper or old magazines",
    },
    {
        "item_name": "Scrap Metal Pile", "category": "Metal", "material": "Assorted steel scraps",
        "description": "From a home renovation project.",
        "weight_kg": 6.2, "quantity": 1, "location_text": "Dita, Santa Rosa, Laguna",
        "trading_for_type": TradingForType.NEGOTIATING, "trading_for_value": None,
    },
    {
        "item_name": "Bulk Cardboard", "category": "Mixed", "material": "Flattened boxes",
        "description": "Dry and clean.",
        "weight_kg": 15.0, "quantity": 9, "location_text": "Pulong Santa Cruz, Santa Rosa, Laguna",
        "trading_for_type": TradingForType.NOTHING, "trading_for_value": None,
    },
]

DEMO_SPOTS = [
    {
        "name": "Garbage Pile", "material": "Plastic",
        "description": "Pile of plastic bottles and containers left near the sari-sari store.",
        "weight_kg": 6.5, "quantity": 12, "location_text": "Tagapo, Santa Rosa, Laguna",
        "permission_note": "Public area, no permission needed.",
    },
    {
        "name": "Overgrown Lot", "material": "Mixed",
        "description": "Vacant lot with scattered scrap metal and cardboard.",
        "weight_kg": 15.0, "quantity": 5, "location_text": "Market Area, Santa Rosa, Laguna",
        "permission_note": "Ask barangay caretaker first.",
    },
]


def seed():
    app = create_app()
    with app.app_context():
        if User.query.first() is not None:
            print("Database already has users — skipping seed.")
            return

        users = []
        for u in DEMO_USERS:
            user = User(password_hash=hash_password(DEMO_PASSWORD), **u)
            db.session.add(user)
            users.append(user)
        db.session.flush()

        for i, t in enumerate(DEMO_TRADES):
            trade = Trade(owner_id=users[i % len(users)].id, status=TradeStatus.OPEN, **t)
            db.session.add(trade)

        for i, s in enumerate(DEMO_SPOTS):
            spot = ResourceSpot(
                reporter_id=users[i % len(users)].id,
                status=ResourceSpotStatus.ACTIVE,
                expires_at=ResourceSpot.default_expiry(app.config["RESOURCE_SPOT_EXPIRY_DAYS"]),
                **s,
            )
            db.session.add(spot)

        db.session.commit()
        print(f"Seeded {len(users)} users, {len(DEMO_TRADES)} trades, {len(DEMO_SPOTS)} resource spots.")
        print(f"Demo login: any of {[u['email'] for u in DEMO_USERS]} / password: {DEMO_PASSWORD}")


if __name__ == "__main__":
    seed()
