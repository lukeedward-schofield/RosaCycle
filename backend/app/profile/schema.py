from app.shared.utils.file_storage import build_media_url


def serialize_user(user):
    return {
        "id": user.id,
        "username": user.username,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "email": user.email,
        "profileImage": build_media_url(user.profile_image_path),
        "role": user.role.value,
        "createdAt": user.created_at.isoformat(),
    }
