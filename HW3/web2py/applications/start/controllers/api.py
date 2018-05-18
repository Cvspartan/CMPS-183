# Here go your api methods.

def get_memos():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    memos = []
    has_more = False
    rows = []
    if auth.user is not None:
        rows = db((db.memo.user_email == auth.user.email)|(db.memo.is_public == "True")).select(limitby=(start_idx, end_idx + 1))
    else:
        rows = db(db.memo.is_public == "True").select(limitby=(start_idx, end_idx + 1))
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            t = dict(
                id = r.id,
                user_email = r.user_email,
                title = r.title,
                memo_content = r.memo_content,
                is_public = r.is_public
            )
            memos.append(t)
        else:
            has_more = True
    logged_in = auth.user is not None
    return response.json(dict(
        memos = memos,
        logged_in = logged_in,
        has_more = has_more,
    ))

@auth.requires_signature()
def add_memo():
    cl_id = db.memo.insert(
        title = request.vars.title,
        memo_content = request.vars.memo_content,
    )
    c = db.memo(cl_id)
    return response.json(dict(memo=c))

@auth.requires_signature()
def delete_memo():
    db(db.memo.id == request.vars.memo_id).delete()
    return "ok"

@auth.requires_signature()
def edit_memo():
    row = db(db.memo.id == request.vars.memo_id).select().first()
    row.update_record(title = request.vars.edit_title)
    row.update_record(memo_content = request.vars.edit_memo_content)
    c = db.memo(request.vars.memo_id)
    l = dict(
        id = c.id,
        title = c.title,
        memo_content = c.memo_content
    )
    return response.json(dict(memo=l))

@auth.requires_signature()
def toggle_visibility():
    memo_id = int(request.vars.memo_id)
    c = db.memo[memo_id]
    c.update_record(is_public = request.vars.is_public)
    return "ok"