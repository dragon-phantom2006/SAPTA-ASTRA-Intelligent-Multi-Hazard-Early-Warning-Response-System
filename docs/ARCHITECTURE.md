# Architecture

## Request path
1. Hardware captures water level/pressure.
2. ESP32 posts telemetry over the local Wi-Fi network to Flask.
3. Flask authenticates the sensor using `X-Device-Key` and validates the schema.
4. Telemetry is stored as an immutable reading.
5. The alert engine loads that sensor's four configured thresholds and determines the current alert level.
6. The ML service is invoked if a trained model exists. Missing model = explicit `not_loaded`, never fake output.
7. If the alert level changes or a new high-severity event is generated, Flask creates an alert and emits `alert:new` through Socket.IO.
8. Member sockets receive only alerts relevant to their stored location/radius. Admin sockets receive operational telemetry/alerts.
9. The alert can be forwarded to a central webhook simultaneously.
10. Members can query nearest registered safe locations and receive route guidance.

## Frontend -> backend map
- Login: `frontend/src/services/api.js` -> `POST /api/v1/auth/login`
- Current user: `GET /api/v1/auth/me`
- Member dashboard: `GET /api/v1/member/dashboard`
- Nearby alerts: `GET /api/v1/alerts/nearby`
- Safe locations: `GET /api/v1/safe-locations/nearest`
- Admin sensors: `GET/POST/PATCH /api/v1/admin/sensors`
- Admin safe locations: `GET/POST/PATCH /api/v1/admin/safe-locations`
- Admin warning by phone: `POST /api/v1/admin/warnings/direct`
- Live updates: Socket.IO events `telemetry:update`, `alert:new`, `notification:new`

## Role boundary
Admin-only endpoints require JWT + `admin` role. Member endpoints cannot manage sensors, safe locations, direct warnings, or view all residents.
