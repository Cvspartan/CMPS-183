import tempfile

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

# Here go your api methods.
def get_users():
    #images = db().select(db.user_images.ALL)
    user = None
    logged_in = None
    if auth.user != None:
        user = auth.user_id
        logged_in  = {}
        logged_in[auth.user_id] = auth.user.first_name + " " + auth.user.last_name
    users = {}
    for r in db(db.user_images.created_by != user).select():
        curr_id = r['created_by'].id
        curr_name = r['created_by'].first_name + " " + r['created_by'].last_name
        users[curr_id] = curr_name
        #print(r['created_by'].id)
    print(logged_in)
    return response.json(dict(users = users, curr_user = logged_in))

@auth.requires_signature()
def add_image():
    t_id = db.user_images.insert(
        image_url = request.vars.image_url,
    )

    return response.json(t_id)

@auth.requires_signature()
def get_images():
    print(request.vars.id)
    images = db(db.user_images.created_by == request.vars.id).select()
    for image in images:
        print(image['created_by'])
    return response.json(images)
