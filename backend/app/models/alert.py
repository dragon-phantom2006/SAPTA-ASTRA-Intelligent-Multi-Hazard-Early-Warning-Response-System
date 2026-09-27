from datetime import datetime, timezone
from ..extensions import db

def utcnow(): return datetime.now(timezone.utc)

class Alert(db.Model):
    __tablename__="alerts"
    id=db.Column(db.Integer, primary_key=True)
    sensor_id=db.Column(db.String(80), nullable=False, index=True)
    level=db.Column(db.Integer, nullable=False)
    code=db.Column(db.String(30), nullable=False)
    title=db.Column(db.String(160), nullable=False)
    message=db.Column(db.Text, nullable=False)
    water_level_m=db.Column(db.Float, nullable=False)
    latitude=db.Column(db.Float, nullable=False)
    longitude=db.Column(db.Float, nullable=False)
    state=db.Column(db.String(80), nullable=False, default="Unknown")
    created_at=db.Column(db.DateTime(timezone=True), default=utcnow)
    acknowledged=db.Column(db.Boolean, default=False, nullable=False)

    def public(self):
        return {
            "id":self.id,
            "sensor_id":self.sensor_id,
            "level":self.level,
            "code":self.code,
            "title":self.title,
            "message":self.message,
            "water_level_m":self.water_level_m,
            "latitude":self.latitude,
            "longitude":self.longitude,
            "state":self.state,
            "created_at":self.created_at.isoformat(),
            "acknowledged":self.acknowledged
        }