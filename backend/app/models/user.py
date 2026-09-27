from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from ..extensions import db

def utcnow():
    return datetime.now(timezone.utc)

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    mobile = db.Column(db.String(32), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255), unique=True, nullable=True, index=True)
    name = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="member")
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    location_mode = db.Column(db.String(20), nullable=False, default="manual")
    state = db.Column(db.String(80), nullable=True)
    alert_radius_km = db.Column(db.Float, nullable=False, default=10.0)
    active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow)

    def set_password(self, p):
        self.password_hash = generate_password_hash(p)

    def check_password(self, p):
        return check_password_hash(self.password_hash, p)

    def public(self):
        return {
            "id": self.id,
            "mobile": self.mobile,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "location_mode": self.location_mode,
            "state": self.state,
            "alert_radius_km": self.alert_radius_km,
        }
