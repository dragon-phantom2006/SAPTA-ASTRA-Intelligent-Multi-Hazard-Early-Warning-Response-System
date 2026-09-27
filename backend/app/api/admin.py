from flask import Blueprint,request

from ..utils.auth import require_role,current_user

from ..models import Sensor,SafeLocation,User,Alert

from ..extensions import db

from ..services.notification_service import notify_user,sms_if_configured

bp=Blueprint("admin",__name__)

@bp.get("/sensors")
@require_role("admin")
def sensors(): return {"sensors":[s.public() for s in Sensor.query.order_by(Sensor.id.desc()).all()]}

@bp.post("/sensors")
@require_role("admin")
def add_sensor():

    d=request.get_json() or {}; required=["sensor_id","name","latitude","longitude","level1_m","level2_m","level3_m","level4_m"]

    if any(k not in d for k in required): return {"error":"All sensor identity, location and four thresholds are required."},400

    if Sensor.query.filter_by(sensor_id=d["sensor_id"]).first(): return {"error":"sensor_id already exists"},409

    key=Sensor.new_key(); s=Sensor(sensor_id=d["sensor_id"],name=d["name"],latitude=float(d["latitude"]),longitude=float(d["longitude"]),state=str(d["state"]).strip(),level1_m=float(d["level1_m"]),level2_m=float(d["level2_m"]),level3_m=float(d["level3_m"]),level4_m=float(d["level4_m"]),device_key_hash=Sensor.hash_key(key))

    if not (s.level1_m<s.level2_m<s.level3_m<s.level4_m): return {"error":"Thresholds must increase from Level 1 to Level 4."},400

    db.session.add(s); db.session.commit(); return {"sensor":s.public(),"device_key":key},201


@bp.delete("/sensors/<int:sensor_id>")
@require_role("admin")
def delete_sensor(sensor_id):

    sensor = Sensor.query.get(sensor_id)

    if not sensor:
        return {"error": "Sensor not found."}, 404

    db.session.delete(sensor)
    db.session.commit()

    return {
        "message": "Sensor deleted successfully.",
        "sensor_id": sensor.sensor_id
    }


@bp.get("/safe-locations")
@require_role("admin")
def safe_locations(): return {"locations":[x.public() for x in SafeLocation.query.order_by(SafeLocation.id.desc()).all()]}

@bp.post("/safe-locations")
@require_role("admin")
def add_safe_location():

    d=request.get_json() or {}

    if not all(k in d for k in ["name","address","latitude","longitude"]): return {"error":"name, address, latitude, longitude required"},400

    x=SafeLocation(name=d["name"],address=d["address"],latitude=float(d["latitude"]),longitude=float(d["longitude"]),capacity=d.get("capacity")); db.session.add(x); db.session.commit(); return {"location":x.public()},201


@bp.delete("/safe-locations/<int:location_id>")
@require_role("admin")
def delete_safe_location(location_id):

    location = SafeLocation.query.get(location_id)

    if not location:
        return {"error": "Safe location not found."}, 404

    db.session.delete(location)
    db.session.commit()

    return {
        "message": "Safe location deleted successfully.",
        "location_id": location_id
    }


@bp.get("/flood-zones")
@require_role("admin")
def flood_zones():

    from ..models import Sensor,Telemetry

    zones=[]

    for sensor in Sensor.query.filter_by(active=True).all():

        latest=Telemetry.query.filter_by(
            sensor_id=sensor.sensor_id
        ).order_by(
            Telemetry.id.desc()
        ).first()

        if latest and latest.water_level_m >= sensor.level1_m:

            water=latest.water_level_m

            level=(
                4 if water >= sensor.level4_m else
                3 if water >= sensor.level3_m else
                2 if water >= sensor.level2_m else
                1
            )

            zones.append({
                "sensor_id":sensor.sensor_id,
                "state":sensor.state,
                "latitude":(
                    latest.latitude
                    if latest.latitude is not None
                    else sensor.latitude
                ),
                "longitude":(
                    latest.longitude
                    if latest.longitude is not None
                    else sensor.longitude
                ),
                "water_level_m":water,
                "level":level
            })

    return {"zones":zones}


@bp.post("/warnings/direct")
@require_role("admin")
def direct_warning():

    d=request.get_json() or {}; mobile=str(d.get("mobile","")).strip(); title=str(d.get("title","Emergency warning")); message=str(d.get("message","")).strip(); severity=str(d.get("severity","WARNING"))

    u=User.query.filter_by(mobile=mobile,active=True).first()

    if not u: return {"error":"Active member with that mobile number was not found."},404

    if not message: return {"error":"message is required"},400

    n=notify_user(u,title,message,severity,"admin_direct")

    sms=sms_if_configured(u.mobile,f"{title}: {message}")

    return {"notification":n.public(),"sms":sms}


@bp.get("/alerts")
@require_role("admin")
def alerts(): return {"alerts":[a.public() for a in Alert.query.order_by(Alert.id.desc()).limit(100).all()]}