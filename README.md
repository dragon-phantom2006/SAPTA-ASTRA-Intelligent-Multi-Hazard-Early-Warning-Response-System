# FloodGuard — Real-Time Flood Monitoring & Community Alert Platform

A deployment-ready React + Flask + Socket.IO platform for live water-sensor telemetry, four-stage flood alerts, AI prediction integration, role-based admin/member dashboards, geospatial notifications, and nearest safe-location guidance.

## Core rule: no dummy data
The application does **not** seed fake telemetry, users, sensors, alerts, safe locations, or map markers. The database starts empty except for an optional bootstrap admin created from environment variables. Hardware telemetry is accepted only from registered sensors with their device key. A terminal simulator is provided strictly as a test client that sends real HTTP requests to the same ingestion endpoint.

## Architecture

`ESP32 / hardware -> LAN/Wi-Fi Flask ingest API -> validation -> database -> rule engine -> optional ML predictor -> Socket.IO -> Admin + nearby Members`

The same ingestion event can also be forwarded to `CENTRAL_WEBHOOK_URL` so a local deployment and central deployment receive the alert. If that variable is empty, the current Flask instance is the central application.

### Alert levels
1. **Level 1 — WATCH**: water level reaches the configured Level-1 threshold.
2. **Level 2 — ADVISORY**: reaches Level-2 threshold.
3. **Level 3 — WARNING**: reaches Level-3 threshold.
4. **Level 4 — EVACUATE**: reaches Level-4 threshold.

Thresholds belong to each physical sensor, so different sensor positions can have different trigger points. No hard-coded real-world flood thresholds are invented.

## Run locally

### Backend
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m app.cli bootstrap-admin
python -m app
```
Backend: `http://127.0.0.1:5000`

### Frontend
```powershell
cd frontend
npm install
copy .env.example .env
npm run dev -- --host 0.0.0.0
```
Frontend: `http://localhost:5173`

For another device on the same Wi-Fi, set `VITE_API_BASE_URL` to the computer's LAN address, e.g. `http://192.168.1.20:5000`, and open the Vite LAN URL.

## Hardware on same Wi-Fi
The ESP32 sends JSON over HTTP to:
`POST http://<FLASK-LAN-IP>:5000/api/v1/telemetry`

Headers:
- `Content-Type: application/json`
- `X-Device-Key: <registered sensor device key>`

Payload example (replace with live readings):
```json
{
  "sensor_id": "YOUR_REGISTERED_SENSOR_ID",
  "water_level_m": 2.31,
  "pressure_kpa": 51.4,
  "battery_v": 4.03,
  "latitude": 22.72,
  "longitude": 88.48,
  "captured_at": "2026-09-18T10:30:00Z"
}
```
The ESP32 should send its actual measured values; the backend never generates substitute telemetry.

## Terminal live-test client
After registering a sensor and obtaining its device key, run:
```powershell
cd backend
python scripts/simulate_telemetry.py --base-url http://127.0.0.1:5000 --sensor-id YOUR_SENSOR_ID --device-key YOUR_DEVICE_KEY
```
The script prompts for values and posts them to the real API. This is not database seeding or application dummy data; it is an external test client.

## Admin bootstrap
Set in `backend/.env`:
```env
BOOTSTRAP_ADMIN_MOBILE=9999999999
BOOTSTRAP_ADMIN_PASSWORD=change-me-now
BOOTSTRAP_ADMIN_NAME=System Admin
```
Then run `python -m app.cli bootstrap-admin`. Change the password before deployment.

## Safe-location workflow
Admins add real shelters/assembly points with name, coordinates, capacity and address. Member map requests `/api/v1/safe-locations/nearest?lat=...&lng=...&limit=5`; the backend calculates actual distance from the supplied coordinates. The frontend can request a walking route from a configurable OSRM-compatible routing service. No fictional safe locations are inserted.

## AI model integration
Put the eventual trained model under `backend/ml/models/` (for example `flood_predictor.joblib`) and set `MODEL_PATH` in `.env`. `backend/app/services/ml_service.py` loads it only when present. If absent, the API explicitly reports `not_loaded`; it never fabricates a prediction. The four-level deterministic safety alert still works from the physical sensor's configured thresholds.

## Production
- Use PostgreSQL via `DATABASE_URL`.
- Put Flask-SocketIO behind an appropriate production server/reverse proxy and configure CORS narrowly.
- Use HTTPS/WSS.
- Store device keys and JWT secrets in environment/secret management.
- Restrict telemetry endpoint to known sensor IDs/device keys and optionally network/VPN/firewall ranges.
- Configure `CENTRAL_WEBHOOK_URL` for local-to-central forwarding.
- Replace the public routing endpoint with an organization-managed routing service if required by operational policy.

## Project documentation
See `docs/ARCHITECTURE.md`, `docs/API_FLOW.md`, `docs/HARDWARE_WIFI.md`, `docs/ML_INTEGRATION.md`, and `docs/DEPLOYMENT.md`.
