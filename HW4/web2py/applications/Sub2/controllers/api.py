import tempfile

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

# Here go your api methods.
def get_user_images():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    user_images = []
    rows = db().select(db.user_images.ALL) 
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            image = dict(
                id = r.id,
                created_on = r.created_on,
                created_by = r.created_by,
                image_url = r.image_url
            )
            user_images.append(image)
    return response.json(dict(
        user_images=user_images,
    ))

@auth.requires_login()
def get_images():
    user_images = []
    logger.info(request.vars.single_user)
    user = request.vars.single_user
    logger.info("getting images for user:"+ user)
    rows = db((db.user_images.user_email == user)).select(db.user_images.ALL) 
    for i, r in enumerate(rows):
            image = dict(
                id = r.id,
                created_on = r.created_on,
                created_by = r.created_by,
                image_url = r.image_url
            )
            user_images.append(image)
    return response.json(dict(
        user_images=user_images,
    ))

@auth.requires_login()
def get_users():
    user_list = [] 
    for r in db(db.auth_user.id > 0).select():
        z = dict(
        first_name = r.first_name,
        last_name = r.last_name,
        email = r.email,
        )
        user_list.append(z)
    logged_in = auth.user_id is not None
    auth_email = None
    if logged_in:
        auth_email = auth.user.email
    return response.json(dict(user_list=user_list,
        logged_in = logged_in
        ))

@auth.requires_login()
@auth.requires_signature()
@auth.requires_signature()
def add_image():
    image_id = db.user_images.insert( image_url=request.vars.image_url,)
    im = db.user_images(image_id)
    user_images = dict(
        id=im.id,
        image_url=request.vars.image_url,
    )
    return response.json(dict(user_images=user_images,))

