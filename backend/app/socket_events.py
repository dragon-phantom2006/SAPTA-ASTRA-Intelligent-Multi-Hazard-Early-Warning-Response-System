from flask_socketio import join_room
from flask import request
from flask_jwt_extended import decode_token
from . import socketio
from .models import User
@socketio.on("connect")
def connect(auth):
    token=(auth or {}).get("token") if isinstance(auth,dict) else None
    if not token: return False
    try:
        claims=decode_token(token); uid=int(claims["sub"]); user=User.query.get(uid)
        if not user or not user.active: return False
        join_room(f"user:{user.id}")
        if user.role=="admin": join_room("admins")
        return True
    except Exception: return False
