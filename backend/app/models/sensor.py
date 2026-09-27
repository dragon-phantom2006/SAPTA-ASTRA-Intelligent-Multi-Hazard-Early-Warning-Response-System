from datetime import datetime, timezone
import secrets, hashlib
from ..extensions import db

def utcnow():
    return datetime.now(timezone.utc)

class Sensor(db.Model):
    __tablename__ = "sensors"
    id = db.Column(db.Integer, primary_key=True)
    sensor_id = db.Column(db.String(80), unique=True, nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    state = db.Column(db.String(80), nullable=False, default="Unknown")
    level1_m = db.Column(db.Float, nullable=False)
    level2_m = db.Column(db.Float, nullable=False)
    level3_m = db.Column(db.Float, nullable=False)
    level4_m = db.Column(db.Float, nullable=False)
    device_key_hash = db.Column(db.String(64), nullable=False)
    active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow)
    last_seen_at = db.Column(db.DateTime(timezone=True), nullable=True)

    def check_key(self, key):
        return hashlib.sha256(key.encode()).hexdigest() == self.device_key_hash

    @staticmethod
    def new_key():
        return secrets.token_urlsafe(32)

    @staticmethod
    def hash_key(key):
        return hashlib.sha256(key.encode()).hexdigest()

    def public(self):
        return {
            "id": self.id,
            "sensor_id": self.sensor_id,
            "name": self.name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "state": self.state,
            "thresholds": {
                "level1_m": self.level1_m,
                "level2_m": self.level2_m,
                "level3_m": self.level3_m,
                "level4_m": self.level4_m,
            },
            "active": self.active,
            "last_seen_at": self.last_seen_at.isoformat() if self.last_seen_at else None,
        }
