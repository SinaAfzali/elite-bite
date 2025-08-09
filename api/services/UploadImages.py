import os
import secrets

from api import settings


def uploadImage(image_file):
    ext = os.path.splitext(image_file.name)[1]
    random_name = secrets.token_hex(32) + ext

    image_path = os.path.join(settings.BASE_DIR, "public\images", random_name)
    os.makedirs(os.path.dirname(image_path), exist_ok=True)

    with open(image_path, "wb+") as destination:
        for chunk in image_file.chunks():
            destination.write(chunk)

    return random_name