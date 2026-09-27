from datetime import datetime, timezone
from ..extensions import db

def utcnow(): return datetime.now(timezone.utc)
class SafeLocation(db.Model):
    __tablename__="safe_locations"
    id=db.Column(db.Integer, primary_key=True)
    name=db.Column(db.String(160), nullable=False)
    address=db.Column(db.String(255), nullable=False)
    latitude=db.Column(db.Float, nullable=False)
    longitude=db.Column(db.Float, nullable=False)
    capacity=db.Column(db.Integer, nullable=True)
    active=db.Column(db.Boolean, default=True, nullable=False)
    created_at=db.Column(db.DateTime(timezone=True), default=utcnow)
    def public(self): return {"id":self.id,"name":self.name,"address":self.address,"latitude":self.latitude,"longitude":self.longitude,"capacity":self.capacity,"active":self.active}
