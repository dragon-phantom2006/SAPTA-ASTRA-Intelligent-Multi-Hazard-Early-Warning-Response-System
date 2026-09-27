from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt, get_jwt_identity
from ..models import User

def current_user(): return User.query.get(int(get_jwt_identity()))
def require_role(role):
    def deco(fn):
        @wraps(fn)
        def wrapped(*a,**kw):
            verify_jwt_in_request()
            if get_jwt().get("role")!=role: return jsonify({"error":"forbidden"}),403
            user=current_user()
            if not user or not user.active: return jsonify({"error":"inactive user"}),403
            return fn(*a,**kw)
        return wrapped
    return deco
