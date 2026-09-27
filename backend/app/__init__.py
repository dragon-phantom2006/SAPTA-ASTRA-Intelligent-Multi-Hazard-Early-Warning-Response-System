import os
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from .extensions import db

load_dotenv()
socketio = SocketIO(cors_allowed_origins="*", async_mode="eventlet")
jwt = JWTManager()

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    os.makedirs(app.instance_path, exist_ok=True)
    app.config.update(
        SECRET_KEY=os.getenv("SECRET_KEY", "dev-only-change-me"),
        JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY", "dev-only-change-me-too"),
        SQLALCHEMY_DATABASE_URI=os.getenv("DATABASE_URL", "sqlite:///floodguard.db"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        MAX_CONTENT_LENGTH=1024*1024,
        JSON_SORT_KEYS=False,
    )
    origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    CORS(app, resources={r"/api/*": {"origins": [o.strip() for o in origins]}})
    db.init_app(app); jwt.init_app(app); socketio.init_app(app, cors_allowed_origins=origins)
    from .models import User, Sensor, Telemetry, Alert, SafeLocation, Notification
    from . import socket_events  # register authenticated Socket.IO connection handler
    from .api.auth import bp as auth_bp
    from .api.telemetry import bp as telemetry_bp
    from .api.admin import bp as admin_bp
    from .api.member import bp as member_bp
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(telemetry_bp, url_prefix="/api/v1")
    app.register_blueprint(admin_bp, url_prefix="/api/v1/admin")
    app.register_blueprint(member_bp, url_prefix="/api/v1")
    @app.get("/api/v1/health")
    def health():
        return {"status":"ok","service":"floodguard-api"}
    with app.app_context():
        db.create_all()
        # Lightweight migration for existing SQLite installations.
        if app.config["SQLALCHEMY_DATABASE_URI"].startswith("sqlite"):
            from sqlalchemy import inspect, text
            inspector = inspect(db.engine)
            if "users" in inspector.get_table_names():
                user_cols = {c["name"] for c in inspector.get_columns("users")}
                if "email" not in user_cols:
                    db.session.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(255)"))
                if "location_mode" not in user_cols:
                    db.session.execute(text("ALTER TABLE users ADD COLUMN location_mode VARCHAR(20) DEFAULT 'manual'"))
                if "state" not in user_cols:
                    db.session.execute(text("ALTER TABLE users ADD COLUMN state VARCHAR(80)"))
            if "sensors" in inspector.get_table_names():
                sensor_cols = {c["name"] for c in inspector.get_columns("sensors")}
                if "state" not in sensor_cols:
                    db.session.execute(text("ALTER TABLE sensors ADD COLUMN state VARCHAR(80) DEFAULT 'Unknown'"))
            if "alerts" in inspector.get_table_names():
                alert_cols = {c["name"] for c in inspector.get_columns("alerts")}
                if "state" not in alert_cols:
                    db.session.execute(text("ALTER TABLE alerts ADD COLUMN state VARCHAR(80) DEFAULT 'Unknown'"))
            db.session.commit()
    return app
