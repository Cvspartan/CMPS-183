import tempfile

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

# Here go your api methods.
# @auth.requires_login()
@auth.requires_signature()
def add_image():
    print("I'm in add_image")
    image_id = db.user_images.insert(
        image_url=request.vars.image_url,
    )
    print(request.vars.image_url)
    user_images = dict(
        id=image_id,
        image_url=request.vars.image_url,
    )

    return response.json(dict(user_images=user_images,))


def get_user_image():
    print("I'm in get_user_Image")
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0

    images = []
    img_url = db().select(db.user_images.ALL, orderby=~db.user_images.created_on)

    for i , r in enumerate(img_url):
        if i < end_idx - start_idx:
            # print(r.created_by)
            im = dict(
                id=r.id,
                created_on=r.created_on,
                created_by=r.created_by,
                image_url=r.image_url
            )
            images.append(im)
    return response.json(dict(user_images=images,
            ))

def get_users():
    print("I'm in get_user")
    user_list = []
    for r in db(db.auth_user.id != auth.user_id ).select(orderby=db.auth_user.id==auth.user_id):
        t = dict(
            first_name = r.first_name,
            last_name = r.last_name,
            email = r.email,
            user_id = r.id
        )
        user_list.append(t)
        print(user_list)
    return response.json(dict(user_list = user_list,))
