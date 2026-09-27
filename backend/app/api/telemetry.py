from datetime import datetime,timezone
from flask import Blueprint,request
from ..models import Sensor,Telemetry,Alert
from ..extensions import db
from ..services.alert_engine import level_for,details
from ..services.notification_service import notify_india_and_state,notify_state_vibration
from ..services.central_forwarder import forward_event
from .. import socketio

bp=Blueprint("telemetry",__name__)

@bp.post("/telemetry")
def ingest():
    key=request.headers.get("X-Device-Key","")
    data=request.get_json() or {}
    sid=str(data.get("sensor_id","")).strip()
    sensor=Sensor.query.filter_by(sensor_id=sid,active=True).first()
    if not sensor or not key or not sensor.check_key(key):
        return {"error":"Unknown sensor or invalid device key."},401

    try:
        water=float(data["water_level_m"])
        pressure=None if data.get("pressure_kpa") is None else float(data["pressure_kpa"])
        battery=None if data.get("battery_v") is None else float(data["battery_v"])
    except (KeyError,ValueError,TypeError):
        return {"error":"water_level_m is required and numeric; optional numeric fields must be valid."},400

    captured=data.get("captured_at")
    try:
        captured_at=datetime.fromisoformat(captured.replace("Z","+00:00")) if captured else datetime.now(timezone.utc)
    except Exception:
        return {"error":"captured_at must be ISO-8601."},400

    previous=Telemetry.query.filter_by(sensor_id=sid).order_by(Telemetry.id.desc()).first()

    reading=Telemetry(
        sensor_id=sid,
        water_level_m=water,
        pressure_kpa=pressure,
        battery_v=battery,
        latitude=data.get("latitude",sensor.latitude),
        longitude=data.get("longitude",sensor.longitude),
        captured_at=captured_at
    )

    sensor.last_seen_at=datetime.now(timezone.utc)
    db.session.add(reading)
    db.session.flush()

    level=level_for(sensor,water)
    alert=None
    if level>0:
        code,title,message=details(level)
        alert=Alert(
            sensor_id=sid,
            level=level,
            code=code,
            title=title,
            message=message,
            water_level_m=water,
            latitude=reading.latitude or sensor.latitude,
            longitude=reading.longitude or sensor.longitude,
            state=sensor.state or "Unknown"
        )
        db.session.add(alert)
        db.session.flush()

    db.session.commit()

    socketio.emit(
        "telemetry:update",
        {
            "sensor":sensor.public(),
            "reading":reading.public(),
            "alert":alert.public() if alert else None
        },
        room="admins"
    )

    forward={
        "event":"telemetry",
        "reading":reading.public(),
        "alert":alert.public() if alert else None
    }
    central=forward_event(forward)

    india_notified=0
    vibration=None
    if alert:
        india_notified, _=notify_india_and_state(alert,sensor)

        crossed_level3=(
            water >= sensor.level3_m and
            (previous is None or previous.water_level_m < sensor.level3_m)
        )
        if crossed_level3:
            vibration=notify_state_vibration(alert,sensor)

    return {
        "reading":reading.public(),
        "alert":alert.public() if alert else None,
        "india_registered_members_notified":india_notified,
        "level3_crossing_vibration":vibration,
        "central_forward":central
    },201
