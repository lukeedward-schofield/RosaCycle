import os

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend/


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev")

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/rosacycle"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Resolved to an absolute path so file-save and file-serve agree regardless
    # of the process's working directory at launch (relative paths otherwise
    # resolve against cwd, which differs across terminals/IDE run configs).
    _upload_root = os.environ.get("UPLOAD_ROOT", os.path.join("instance", "uploads"))
    UPLOAD_ROOT = _upload_root if os.path.isabs(_upload_root) else os.path.join(_BASE_DIR, _upload_root)
    PUBLIC_BASE_URL = os.environ.get("PUBLIC_BASE_URL", "http://localhost:5000")
    MAX_CONTENT_LENGTH = int(os.environ.get("MAX_CONTENT_LENGTH_MB", "10")) * 1024 * 1024

    RESOURCE_SPOT_EXPIRY_DAYS = int(os.environ.get("RESOURCE_SPOT_EXPIRY_DAYS", "14"))
    PROFILE_EDIT_COOLDOWN_DAYS = int(os.environ.get("PROFILE_EDIT_COOLDOWN_DAYS", "7"))

    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
