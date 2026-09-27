from datetime import datetime, timezone
from ..extensions import db

def utcnow():
    return datetime.now(timezone.utc)

class DeviceToken(db.Model):
    __tablename__ = "device_tokens"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    token = db.Column(db.Text, unique=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow)
