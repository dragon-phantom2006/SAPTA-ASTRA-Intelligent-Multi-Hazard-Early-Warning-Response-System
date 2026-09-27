from flask import Blueprint,request
from flask_jwt_extended import create_access_token,jwt_required,get_jwt_identity
from ..models import User
from ..extensions import db
from ..services.firebase_service import verify_google_token, sync_member_to_firestore
from ..services.location_service import resolve_indian_state

bp=Blueprint("auth",__name__)

@bp.post("/login")
def login():
    data=request.get_json() or {}
    mobile=str(data.get("mobile","")).strip()
    password=str(data.get("password",""))
    requested=str(data.get("role","member"))
    user=User.query.filter_by(mobile=mobile).first()
    if not user or not user.active or user.role!=requested or not user.check_password(password):
        return {"error":"Invalid mobile, password, or role."},401
    token=create_access_token(identity=str(user.id),additional_claims={"role":user.role,"mobile":user.mobile})
    return {"access_token":token,"user":user.public()}

@bp.post("/google")
def google_login():
    data=request.get_json() or {}
    id_token=str(data.get("id_token","")).strip()
    if not id_token:
        return {"error":"Google ID token is required."},400
    try:
        claims=verify_google_token(id_token)
    except Exception as exc:
        return {"error":f"Google authentication failed: {exc}"},401

    uid=str(claims.get("uid",""))
    email=str(claims.get("email","")).strip().lower()
    name=str(claims.get("name") or email.split("@")[0] or "Member").strip()
    if not uid or not email:
        return {"error":"Google account did not provide a valid identity."},400

    user=User.query.filter_by(email=email).first()
    if not user:
        # Keep the legacy non-null mobile field without asking Google members for a phone number.
        synthetic_mobile="google_"+uid[:24]
        user=User(mobile=synthetic_mobile,email=email,name=name,role="member",location_mode="manual")
        user.set_password(uid)
        db.session.add(user)
        db.session.commit()
    else:
        user.name=name
        db.session.commit()

    sync_member_to_firestore(user)
    token=create_access_token(identity=str(user.id),additional_claims={"role":"member","email":email})
    return {"access_token":token,"user":user.public()}

@bp.post("/register")
def register():
    data=request.get_json() or {}
    mobile=str(data.get("mobile","")).strip()
    name=str(data.get("name","")).strip()
    password=str(data.get("password",""))
    if not mobile or not name or len(password)<8:
        return {"error":"mobile, name and an 8+ character password are required."},400
    if User.query.filter_by(mobile=mobile).first():
        return {"error":"Mobile already registered."},409
    lat=data.get("latitude")
    lng=data.get("longitude")
    state=resolve_indian_state(lat,lng) if lat is not None and lng is not None else None
    u=User(
        mobile=mobile,
        name=name,
        role="member",
        latitude=lat,
        longitude=lng,
        state=state,
        location_mode=str(data.get("location_mode","manual")),
        alert_radius_km=float(data.get("alert_radius_km",10))
    )
    u.set_password(password)
    db.session.add(u)
    db.session.commit()
    sync_member_to_firestore(u)
    return {"user":u.public()},201

@bp.get("/me")
@jwt_required()
def me():
    u=User.query.get(int(get_jwt_identity()))
    return {"user":u.public()}
