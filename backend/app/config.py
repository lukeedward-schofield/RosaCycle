import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev")
    
    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "870031204616-e1cvvs7qd31ik6ef993f70baji0v1273.apps.googleusercontent.com")
    
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/rosacycle"
    )

    UPLOAD_ROOT = os.environ.get("UPLOAD_ROOT", os.path.join("instance", "uploads"))
    PUBLIC_BASE_URL = os.environ.get("PUBLIC_BASE_URL", "http://localhost:5000")
    MAX_CONTENT_LENGTH = int(os.environ.get("MAX_CONTENT_LENGTH_MB", "10")) * 1024 * 1024

    RESOURCE_SPOT_EXPIRY_DAYS = int(os.environ.get("RESOURCE_SPOT_EXPIRY_DAYS", "14"))
    PROFILE_EDIT_COOLDOWN_DAYS = int(os.environ.get("PROFILE_EDIT_COOLDOWN_DAYS", "7"))

    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
