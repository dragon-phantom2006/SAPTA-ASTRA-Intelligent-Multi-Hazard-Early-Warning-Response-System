# Deployment

## Render-style deployment
### Backend
- Root directory: `backend`
- Build/install: `pip install -r requirements.txt`
- Start: `gunicorn --worker-class eventlet -w 1 wsgi:app`
- Environment: `DATABASE_URL`, `SECRET_KEY`, `JWT_SECRET_KEY`, `CORS_ORIGINS`, optional `CENTRAL_WEBHOOK_URL` and SMS variables.

For a LAN hardware deployment, use a machine inside the same network instead of a public-only server; internet cloud deployment cannot be reached directly by a private ESP32 LAN without a tunnel/VPN.

### Frontend
- Root directory: `frontend`
- Build: `npm ci && npm run build`
- Serve `dist` with a static host.
- Set `VITE_API_BASE_URL` to the backend public/LAN URL.

## Production database
SQLite is convenient for local testing. Use PostgreSQL in production.

## WebSockets
Flask-SocketIO provides the low-latency push channel used by the dashboard. Production reverse proxy must support WebSocket upgrades.
