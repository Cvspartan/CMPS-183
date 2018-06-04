# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

def get_user_email():
    return auth.user.email if auth.user else None

db.define_table('user_images',
                Field('created_on','datetime',default=datetime.datetime.utcnow()),
                Field('created_by','reference auth_user', default = auth.user_id),
                Field('image_url'),
                )
# db.post.user_email.readable = db.post.user_email.writable = False
# db.post.post_content.requires = IS_NOT_EMPTY()
db.user_images.created_on.readable = db.user_images.created_on.writable = False
db.user_images.created_by.readable = db.user_images.created_by.writable = False
# db.post.updated_on.readable = db.post.updated_on.writable = False
# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
