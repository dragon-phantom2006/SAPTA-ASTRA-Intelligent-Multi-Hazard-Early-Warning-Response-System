# API and data flow

### Telemetry
`POST /api/v1/telemetry`

Headers: `X-Device-Key`

Body fields: `sensor_id`, `water_level_m`, optional `pressure_kpa`, `battery_v`, optional GPS, optional device timestamp.

Response includes the stored reading, calculated alert level, and ML status. The endpoint is designed for an actual ESP32/edge client.

### Direct admin warning
`POST /api/v1/admin/warnings/direct`
```json
{"mobile":"9876543210","title":"Flood warning","message":"Move to the designated safe location.","severity":"WARNING"}
```
This creates an in-app notification. If Twilio variables are configured, the notification service can also send SMS. Without a provider, it does not pretend SMS was sent.

### WebSocket
After login, the frontend connects to Socket.IO and sends its JWT in the auth payload. The server places the socket into an admin room or a location-aware member room. New alerts are pushed without page refresh.
