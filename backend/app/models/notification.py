from datetime import datetime, timezone
from ..extensions import db

def utcnow(): return datetime.now(timezone.utc)
class Notification(db.Model):
    __tablename__="notifications"
    id=db.Column(db.Integer, primary_key=True)
    user_id=db.Column(db.Integer, nullable=False, index=True)
    title=db.Column(db.String(160), nullable=False)
    message=db.Column(db.Text, nullable=False)
    severity=db.Column(db.String(30), nullable=False)
    source=db.Column(db.String(30), nullable=False, default="system")
    alert_id=db.Column(db.Integer, nullable=True)
    read=db.Column(db.Boolean, default=False, nullable=False)
    created_at=db.Column(db.DateTime(timezone=True), default=utcnow)
    def public(self): return {"id":self.id,"title":self.title,"message":self.message,"severity":self.severity,"source":self.source,"alert_id":self.alert_id,"read":self.read,"created_at":self.created_at.isoformat()}
