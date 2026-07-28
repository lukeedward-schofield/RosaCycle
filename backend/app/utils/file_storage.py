import io
import os
import uuid

from flask import current_app
from PIL import Image
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


def _extension(filename):
    if "." not in filename:
        return None
    return filename.rsplit(".", 1)[1].lower()


def save_image(file_storage, subfolder):
    """Validates, strips EXIF, and saves an uploaded image under UPLOAD_ROOT/subfolder.

    Returns the relative path to store on the model (e.g. "trades/<uuid>.jpg").
    """
    filename = secure_filename(file_storage.filename or "")
    ext = _extension(filename)
    if ext not in ALLOWED_EXTENSIONS:
        from app.utils.errors import ValidationError

        raise ValidationError("Unsupported image type. Use JPEG, PNG, or WEBP.")

    image = Image.open(file_storage.stream)
    image = image.convert("RGB") if ext in ("jpg", "jpeg") else image.copy()

    # Strip EXIF (including GPS tags) by re-saving pixel data only.
    clean = Image.new(image.mode, image.size)
    clean.putdata(list(image.getdata()))

    upload_root = current_app.config["UPLOAD_ROOT"]
    target_dir = os.path.join(upload_root, subfolder)
    os.makedirs(target_dir, exist_ok=True)

    new_filename = f"{uuid.uuid4()}.{ext}"
    target_path = os.path.join(target_dir, new_filename)

    buffer = io.BytesIO()
    save_format = "JPEG" if ext in ("jpg", "jpeg") else ext.upper()
    clean.save(buffer, format=save_format)
    with open(target_path, "wb") as f:
        f.write(buffer.getvalue())

    return f"{subfolder}/{new_filename}"


def build_media_url(relative_path):
    if not relative_path:
        return None
    base = current_app.config["PUBLIC_BASE_URL"].rstrip("/")
    return f"{base}/media/{relative_path}"
