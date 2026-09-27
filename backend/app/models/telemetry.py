from datetime import datetime, timezone
from ..extensions import db

def utcnow(): return datetime.now(timezone.utc)
class Telemetry(db.Model):
    __tablename__="telemetry"
    id=db.Column(db.Integer, primary_key=True)
    sensor_id=db.Column(db.String(80), nullable=False, index=True)
    water_level_m=db.Column(db.Float, nullable=False)
    pressure_kpa=db.Column(db.Float, nullable=True)
    battery_v=db.Column(db.Float, nullable=True)
    latitude=db.Column(db.Float, nullable=True)
    longitude=db.Column(db.Float, nullable=True)
    captured_at=db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    received_at=db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    def public(self): return {"id":self.id,"sensor_id":self.sensor_id,"water_level_m":self.water_level_m,"pressure_kpa":self.pressure_kpa,"battery_v":self.battery_v,"latitude":self.latitude,"longitude":self.longitude,"captured_at":self.captured_at.isoformat(),"received_at":self.received_at.isoformat()}
