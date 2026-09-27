# Hardware on the same Wi-Fi

## Network model
The ESP32 and the computer running Flask must be reachable on the same LAN. Find the Flask computer's LAN IPv4 address (`ipconfig` on Windows). Example: `192.168.1.20`.

Run Flask on `0.0.0.0:5000`, then configure the ESP32 firmware with:
`http://192.168.1.20:5000/api/v1/telemetry`

Do not use `localhost` from the ESP32; `localhost` means the ESP32 itself.

## Firewall
Allow inbound TCP 5000 on the private network profile, or place Flask behind a local reverse proxy.

## Device authentication
Every sensor row has a generated device key. The ESP32 stores that key and sends it in `X-Device-Key`. The backend hashes the key in the database and never needs to store the raw key after registration. If lost, rotate the key from the admin UI/API.

## Offline resilience
The reference hardware architecture includes SD-card storage. The backend accepts timestamped readings, so firmware can buffer readings locally and upload them later. The server does not manufacture missing readings.
