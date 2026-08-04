import os

from flask import Flask, current_app, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.config import Config
from app.shared.database import db, migrate
from app.shared.utils.errors import register_error_handlers
from app.shared.utils.rate_limit import limiter


def create_app(config_object=Config):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_object)

    db.init_app(app)
    migrate.init_app(app, db)

    with app.app_context():
        from app.shared import models  # noqa: F401  (registers models with SQLAlchemy metadata)
    JWTManager(app)
    CORS(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)
    limiter.init_app(app)

    register_error_handlers(app)
    _register_blueprints(app)

    os.makedirs(app.config["UPLOAD_ROOT"], exist_ok=True)

    @app.get("/")
    def index():
        return {
            "service": "RosaCycle API",
            "status": "ok",
            "docs": "backend/docs/API.md",
            "health": "/health",
        }

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.get("/media/<path:filename>")
    def media(filename):
        return send_from_directory(current_app.config["UPLOAD_ROOT"], filename)

    return app


def _register_blueprints(app):
    from app.auth.routes import auth_bp
    from app.profile.routes import user_bp
    from app.trades.routes import trade_bp
    from app.trades.offer.routes import offer_bp
    from app.map.routes import resource_spot_bp
    from app.shared.notification.routes import notification_bp
    from app.shared.rating.routes import rating_bp
    from app.scan.routes import ai_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(trade_bp)
    app.register_blueprint(offer_bp)
    app.register_blueprint(resource_spot_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(rating_bp)
    app.register_blueprint(ai_bp)
