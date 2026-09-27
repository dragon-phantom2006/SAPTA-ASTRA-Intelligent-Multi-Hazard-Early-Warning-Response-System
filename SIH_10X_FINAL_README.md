# SIH Environmental Monitoring Network — 7-Hazard FloodGuard Integration

This package uses the original FloodGuard project as the base and integrates six additional hazard dashboards into the same React application.

## Seven dashboards
1. Flood — original FloodGuard implementation
2. Forest Fire
3. Temperature
4. Air Pollution
5. Landslide
6. Water Quality
7. Industrial Emission

## Roles
- Admin: existing FloodGuard command pages plus all six hazard dashboards.
- Member: existing FloodGuard community safety pages plus all six hazard dashboards.

## FloodGuard preservation
The original FloodGuard dashboard/page, sensor, safe-location, warning, map, authentication, API and socket source files are retained. The integration adds routes/navigation and the new hazard dashboard component around them.

## Mobile
The shared navigation is now a responsive slide-in sidebar. A horizontal hazard switcher is also available above the content for quick movement between the seven dashboards.

## Run on Windows
```powershell
cd frontend
npm install
npm run dev
```
Then open the Vite URL shown in the terminal.

Do not copy the old `node_modules` from the uploaded archive. `npm install` should create the correct Windows-native dependencies.

## Real-data behavior
The six new dashboards intentionally show `Pending` / `Awaiting live connection` until their corresponding sensor/API streams are connected. No fabricated telemetry values are presented as live measurements.
