import tempfile

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

# Here go your api methods.


# Here go your api methods.
# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------


def index():
    """
    example action using the internationalization operator T and flash
    rendered by views/default/index.html or views/generic.html

    if you need a simple wiki simply replace the two lines below with:
    return auth.wiki()
    """
    logger.info('The session is: %r' % session)
    # the next two lines were taken from the piazza post
    # titled "Display other user's public memos in a user's page?"
    if auth.user is not None:
        checklists = db((db.checklist.user_email == auth.user.email)|(db.checklist.is_public == "True")).select(db.checklist.ALL)
    else:
        checklists = db(db.checklist.is_public is True).select(db.checklist.ALL)
    return dict(checklists=checklists)


def no_swearing(form):
    if 'fool' in form.vars.memo:
        form.errors.memo = T('No swearing please')

def add():
    """Adds a checklist."""
    form = SQLFORM(db.checklist)
    if form.process(onvalidation=no_swearing).accepted:
        session.flash = T("Checklist added.")
        redirect(URL('default','index'))
    elif form.errors:
        session.flash = T('Please correct the info')
    return dict(form=form)

@auth.requires_login()
@auth.requires_signature()
def delete():
    if request.args(0) is not None:
        q = ((db.checklist.user_email == auth.user.email) &
             (db.checklist.id == request.args(0)))
        db(q).delete()
    redirect(URL('default', 'index'))


@auth.requires_login()
def edit():
    """
    - "/edit/3" it offers a form to edit a checklist.
    'edit' is the controller (this function)
    '3' is request.args[0]
    """
    if request.args(0) is None:
        # We send you back to the general index.
        redirect(URL('default', 'index'))
    else:
        q = ((db.checklist.user_email == auth.user.email) &
             (db.checklist.id == request.args(0)))
        # I fish out the first element of the query, if there is one, otherwise None.
        cl = db(q).select().first()
        if cl is None:
            session.flash = T('Not Authorized')
            redirect(URL('default', 'index'))
        # Always write invariants in your code.
        # Here, the invariant is that the checklist is known to exist.
        # Is this an edit form?
        form = SQLFORM(db.checklist, record=cl, deletable=False)
        if form.process(onvalidation=no_swearing).accepted:
            # At this point, the record has already been edited.
            session.flash = T('Checklist edited.')
            redirect(URL('default', 'index'))
        elif form.errors:
            session.flash = T('Please enter correct values.')
    return dict(form=form)

# this code was developed with help from the piazza post
# titled "toggle_public not working"
@auth.requires_login()
@auth.requires_signature()
def toggle_public():
    if request.args(0) is not None:
        q = ((db.checklist.user_email == auth.user.email) &
             (db.checklist.id == request.args(0)))
        cl=db(q).select().first()
        if cl.is_public is False:
            cl.update_record(is_public = True)
        else:
            cl.update_record(is_public = False)
    redirect(URL('default', 'index'))



def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/bulk_register
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    also notice there is http://..../[app]/appadmin/manage/auth to allow administrator to manage users
    """
    return dict(form=auth())


@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()

# developed referencing the piazza post
# titled 'Images disappear when refresh'
@auth.requires_login()
@auth.requires_signature()
def add_image():
    print("entered add_image")
    image_id = db.user_images.insert(
        image_url=request.vars.image_url,
    )
    user_images = dict(
        id=image_id,
        image_url=request.vars.image_url,
    )
    return response.json(dict(user_images=user_images,))


# devloped referencing code mentioned in piazza post
# titled 'get_user_images in api.py thinks a dict is a 'tuple'?'
def get_user_image():
    images = []
    img_url = db().select(db.user_images.ALL)
    for r in rows:
        img = dict(
	    id = r.id,
	    created_on = r.created_on,
	    created_by = r.created_by,
	    image_url = r.image_url,
	)
	images.append(img)
    return response.json(dict(user_images=images))

# developed using professor Luca's code regarding user names
def get_user_names():
    user_name_list = []
    for r in db(db.auth_user.id != auth.user.id).select():
        na = dict(
        first_name = r.first_name
        last_name = r.last_name
        email = r.email
        user_id = r.id
        )
        users.append(na)
        logger.info(na)
        return response.json(dict(user_name_list = user_name_list,))
