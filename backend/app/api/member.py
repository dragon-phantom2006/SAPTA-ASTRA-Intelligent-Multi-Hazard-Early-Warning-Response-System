from flask import Blueprint,request
from flask_jwt_extended import jwt_required
from ..utils.auth import current_user,require_role
from ..models import Alert,SafeLocation,Notification,DeviceToken,User
from ..extensions import db
from ..services.location_service import resolve_indian_state
from ..services.firebase_service import sync_member_to_firestore
from math import radians,sin,cos,asin,sqrt

bp=Blueprint("member",__name__)

def dist(a,b,c,d):
    R=6371
    p1,p2=radians(a),radians(c)
    dp=radians(c-a); dl=radians(d-b)
    x=sin(dp/2)**2+cos(p1)*cos(p2)*sin(dl/2)**2
    return 2*R*asin(sqrt(x))

@bp.put("/member/profile/location")
@require_role("member")
def update_location():
    u=current_user()
    d=request.get_json() or {}
    try:
        lat=float(d["latitude"]); lng=float(d["longitude"])
        mode=str(d.get("location_mode",u.location_mode or "manual"))
        radius=float(d.get("alert_radius_km",u.alert_radius_km))
    except (KeyError,TypeError,ValueError):
        return {"error":"latitude and longitude must be numeric."},400
    previous_lat=u.latitude
    previous_lng=u.longitude
    u.latitude=lat
    u.longitude=lng
    u.location_mode=mode if mode in ("live","manual") else "manual"
    u.alert_radius_km=radius

    # Avoid reverse-geocoding every live-location update. Re-check after a
    # meaningful movement or whenever the member has no known state.
    moved_km=0.0
    if previous_lat is not None and previous_lng is not None:
        moved_km=dist(previous_lat,previous_lng,lat,lng)
    if not u.state or moved_km>=20:
        u.state=resolve_indian_state(lat,lng) or u.state
    db.session.commit()
    sync_member_to_firestore(u)
    return {"user":u.public()}

@bp.put("/member/profile/location-mode")
@require_role("member")
def location_mode():
    u=current_user()
    d=request.get_json() or {}
    mode=str(d.get("location_mode","")).strip().lower()
    if mode not in ("live","manual"):
        return {"error":"location_mode must be live or manual."},400
    u.location_mode=mode
    db.session.commit()
    sync_member_to_firestore(u)
    return {"user":u.public()}

@bp.put("/member/profile/mobile")
@require_role("member")
def update_mobile():
    u=current_user()
    d=request.get_json() or {}

    mobile=str(d.get("mobile","")).strip()

    if not mobile:
        return {"error":"Mobile number is required."},400

    if not mobile.isdigit() or len(mobile)!=10:
        return {"error":"Enter a valid 10-digit mobile number."},400

    existing=User.query.filter(
        User.mobile==mobile,
        User.id!=u.id
    ).first()

    if existing:
        return {"error":"This mobile number is already registered."},409

    u.mobile=mobile
    db.session.commit()
    sync_member_to_firestore(u)

    return {"user":u.public()}

@bp.post("/member/device-token")
@require_role("member")
def register_device_token():
    token=str((request.get_json() or {}).get("token","")).strip()
    if not token:
        return {"error":"FCM token is required."},400
    existing=DeviceToken.query.filter_by(token=token).first()
    if existing:
        existing.user_id=current_user().id
    else:
        db.session.add(DeviceToken(user_id=current_user().id,token=token))
    db.session.commit()
    return {"status":"registered"}

@bp.get("/member/dashboard")
@require_role("member")
def dashboard():
    u=current_user()
    notes=Notification.query.filter_by(user_id=u.id).order_by(Notification.id.desc()).limit(20).all()
    return {"user":u.public(),"notifications":[n.public() for n in notes]}

@bp.get("/notifications")
@require_role("member")
def notifications():
    u=current_user()
    return {"notifications":[n.public() for n in Notification.query.filter_by(user_id=u.id).order_by(Notification.id.desc()).limit(100).all()]}

@bp.post("/notifications/<int:nid>/read")
@require_role("member")
def mark_read(nid):
    u=current_user()
    n=Notification.query.filter_by(id=nid,user_id=u.id).first_or_404()
    n.read=True
    db.session.commit()
    return {"notification":n.public()}

@bp.get("/alerts/nearby")
@require_role("member")
def nearby_alerts():
    u=current_user()
    lat=request.args.get("lat",u.latitude,type=float)
    lng=request.args.get("lng",u.longitude,type=float)
    radius=request.args.get("radius",u.alert_radius_km,type=float)
    if lat is None or lng is None:
        return {"error":"Set your location or allow location access."},400
    result=[]
    for a in Alert.query.order_by(Alert.id.desc()).limit(200).all():
        d=dist(lat,lng,a.latitude,a.longitude)
        if d<=radius:
            result.append({**a.public(),"distance_km":round(d,3)})
    return {"alerts":result}

@bp.get("/flood-zones")
@require_role("member")
def flood_zones():
    from ..models import Sensor,Telemetry
    zones=[]
    for sensor in Sensor.query.filter_by(active=True).all():
        latest=Telemetry.query.filter_by(sensor_id=sensor.sensor_id).order_by(Telemetry.id.desc()).first()
        if latest and latest.water_level_m >= sensor.level1_m:
            zones.append({
                "sensor_id":sensor.sensor_id,
                "state":sensor.state,
                "latitude":latest.latitude if latest.latitude is not None else sensor.latitude,
                "longitude":latest.longitude if latest.longitude is not None else sensor.longitude,
                "water_level_m":latest.water_level_m,
                "level":(
                    4 if latest.water_level_m >= sensor.level4_m else
                    3 if latest.water_level_m >= sensor.level3_m else
                    2 if latest.water_level_m >= sensor.level2_m else 1
                )
            })
    return {"zones":zones}

@bp.get("/safe-locations/nearest")
@jwt_required()
def nearest_safe():
    u=current_user()
    lat=request.args.get("lat",u.latitude,type=float)
    lng=request.args.get("lng",u.longitude,type=float)
    limit=max(1,min(request.args.get("limit",5,type=int),20))
    if lat is None or lng is None:
        return {"error":"Latitude and longitude required."},400
    result=[]
    for s in SafeLocation.query.filter_by(active=True).all():
        result.append({**s.public(),"distance_km":round(dist(lat,lng,s.latitude,s.longitude),3)})
    result.sort(key=lambda x:x["distance_km"])
    return {"locations":result[:limit]}