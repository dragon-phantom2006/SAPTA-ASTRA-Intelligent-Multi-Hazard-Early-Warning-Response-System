import os, requests
from ..extensions import db
from ..models import Notification, User, DeviceToken
from .. import socketio

def notify_user(user, title, message, severity, source="system", alert_id=None, vibration=False, state=None):
    n = Notification(
        user_id=user.id,
        title=title,
        message=message,
        severity=severity,
        source=source,
        alert_id=alert_id
    )
    db.session.add(n)
    db.session.commit()
    socketio.emit("notification:new", {
        **n.public(),
        "vibration": bool(vibration),
        "state": state
    }, room=f"user:{user.id}")
    return n

def sms_if_configured(mobile, message):
    sid=os.getenv("TWILIO_ACCOUNT_SID"); token=os.getenv("TWILIO_AUTH_TOKEN"); frm=os.getenv("TWILIO_FROM_NUMBER")
    if not all([sid,token,frm]): return {"status":"not_configured"}
    try:
        r=requests.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
            auth=(sid,token),
            data={"From":frm,"To":mobile,"Body":message},
            timeout=10
        )
        r.raise_for_status()
        return {"status":"sent","provider":"twilio","sid":r.json().get("sid")}
    except Exception as e:
        return {"status":"error","error":str(e)}

def send_fcm_to_users(users, title, message, state, vibration=False):
    tokens = []
    for u in users:
        tokens.extend([x.token for x in DeviceToken.query.filter_by(user_id=u.id).all()])
    if not tokens:
        return {"status": "no_registered_devices", "sent": 0}
    try:
        from firebase_admin import messaging
        sent = 0
        invalid = []
        for token in tokens:
            try:
                msg = messaging.Message(
                    notification=messaging.Notification(title=title, body=message),
                    data={
                        "state": state or "Unknown",
                        "vibration": "true" if vibration else "false",
                    },
                    token=token,
                    webpush=messaging.WebpushConfig(
                        notification=messaging.WebpushNotification(
                            title=title,
                            body=message,
                            icon="/icon-192.png",
                            vibrate=[500, 250, 500] if vibration else [0],
                        )
                    ),
                )
                messaging.send(msg)
                sent += 1
            except Exception as exc:
                if "registration-token-not-registered" in str(exc).lower() or "unregistered" in str(exc).lower():
                    invalid.append(token)
        for token in invalid:
            DeviceToken.query.filter_by(token=token).delete()
        db.session.commit()
        return {"status": "sent", "sent": sent}
    except Exception as exc:
        return {"status": "error", "error": str(exc)}

def notify_india_and_state(alert, sensor):
    state = sensor.state or "Unknown"
    users = User.query.filter_by(active=True, role="member").all()
    message = f"{alert.message} State: {state}."
    for u in users:
        notify_user(u, alert.title, message, alert.code, "sensor_alert", alert.id, vibration=False, state=state)
    fcm = send_fcm_to_users(users, alert.title, message, state, vibration=False)
    return len(users), fcm

def notify_state_vibration(alert, sensor):
    state = sensor.state or "Unknown"
    users = User.query.filter_by(active=True, role="member", state=state).all()
    message = f"{alert.message} State: {state}. This alert requires immediate attention."
    for u in users:
        notify_user(
            u,
            "URGENT FLOOD ALERT",
            message,
            alert.code,
            "sensor_alert",
            alert.id,
            vibration=True,
            state=state
        )
    return send_fcm_to_users(users, "URGENT FLOOD ALERT", message, state, vibration=True)

def notify_nearby_users(alert):
    users=User.query.filter(User.active==True,User.latitude.isnot(None),User.longitude.isnot(None)).all()
    from math import radians,sin,cos,asin,sqrt
    def km(a,b,c,d):
        R=6371; p1,p2=radians(a),radians(c); dp=radians(c-a); dl=radians(d-b)
        x=sin(dp/2)**2+cos(p1)*cos(p2)*sin(dl/2)**2
        return 2*R*asin(sqrt(x))
    count=0
    for u in users:
        dist=km(u.latitude,u.longitude,alert.latitude,alert.longitude)
        if dist<=u.alert_radius_km:
            notify_user(u,alert.title,alert.message,alert.code,"sensor_alert",alert.id)
            count+=1
    return count
