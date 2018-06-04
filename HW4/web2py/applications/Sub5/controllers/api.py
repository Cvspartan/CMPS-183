import tempfile

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

def get_users():
    users = []
    logged_in_user = None
    if auth.user is not None:
        logged_in_user = dict(
            id = auth.user.id,
            first_name = auth.user.first_name,
            last_name = auth.user.last_name,
            email = auth.user.email
        )
        for r in db(db.auth_user.id != auth.user.id).select():
            user = dict(
                id = r.id,
                first_name = r.first_name,
                last_name = r.last_name,
                email = r.email
            )
            users.append(user)
    return response.json(dict(users=users, logged_in_user=logged_in_user))


@auth.requires_signature()
def add_photo():
    p_id = db.user_images.insert(
        image_url = request.vars.image_url
    )
    return "ok"


@auth.requires_signature()
def get_user_images():
    images = []
    rows = db(db.user_images.created_by == request.vars.user_id).select()
    for i, r in enumerate(rows):
        images.append(dict(image_url = r.image_url))
    return response.json(dict(images=images))
