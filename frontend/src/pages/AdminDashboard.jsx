import { useEffect, useState } from 'react';

import Layout from '../components/Layout';
import LiveMap from '../components/LiveMap';
import StatusPill from '../components/StatusPill';
import API from '../services/api';
import { connectSocket } from '../services/socket';
import { formatTimeIST } from '../utils/dateTime';

export default function AdminDashboard() {
    const [sensors, setSensors] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [floodZones, setFloodZones] = useState([]);
    const [latest, setLatest] = useState(null);

    useEffect(() => {
        Promise.all([
            API.get('/admin/sensors'),
            API.get('/admin/alerts'),
            API.get('/admin/flood-zones')
        ]).then(([a, b, c]) => {
            setSensors(a.data.sensors);
            setAlerts(b.data.alerts);
            setFloodZones(c.data.zones);
        });

        const s = connectSocket(
            localStorage.getItem('floodguard_token')
        );

        s.on('telemetry:update', x => {
            setLatest(x);

            setSensors(old =>
                old.map(v =>
                    v.sensor_id === x.sensor.sensor_id
                        ? x.sensor
                        : v
                )
            );

            if (x.alert) {
                setAlerts(old => [
                    x.alert,
                    ...old
                ]);
            }

            setFloodZones(old => {
                const existing = old.filter(
                    z => z.sensor_id !== x.sensor.sensor_id
                );

                const water = x.reading?.water_level_m;
                const thresholds = x.sensor?.thresholds;

                if (
                    water != null &&
                    thresholds &&
                    water >= thresholds.level1_m
                ) {
                    const level =
                        water >= thresholds.level4_m
                            ? 4
                            : water >= thresholds.level3_m
                                ? 3
                                : water >= thresholds.level2_m
                                    ? 2
                                    : 1;

                    return [
                        ...existing,
                        {
                            sensor_id: x.sensor.sensor_id,
                            state: x.sensor.state,
                            latitude:
                                x.reading.latitude ??
                                x.sensor.latitude,
                            longitude:
                                x.reading.longitude ??
                                x.sensor.longitude,
                            water_level_m: water,
                            level
                        }
                    ];
                }

                return existing;
            });
        });

        return () => s.disconnect();
    }, []);

    return (
        <Layout admin>
            <div className="kpi-grid">
                <div>
                    <span>Registered sensors</span>
                    <b>{sensors.length}</b>
                </div>

                <div>
                    <span>Active alert records</span>
                    <b>{alerts.length}</b>
                </div>

                <div>
                    <span>Live pipeline</span>
                    <b className="online">ONLINE</b>
                </div>
            </div>

            <div className="dashboard-grid">
                <section>
                    <div className="section-head">
                        <div>
                            <span className="eyebrow">
                                LIVE COMMAND MAP
                            </span>

                            <h2>Sensor network</h2>
                        </div>
                    </div>

                    <LiveMap
                        alerts={[]}
                        locations={[]}
                        floodZones={floodZones}
                    />
                </section>

                <section>
                    <div className="section-head">
                        <div>
                            <span className="eyebrow">
                                INGESTION STREAM
                            </span>

                            <h2>Latest telemetry</h2>
                        </div>
                    </div>

                    {latest ? (
                        <div className="telemetry-card">
                            <div>
                                <StatusPill
                                    level={latest.alert?.level || 0}
                                />

                                <b>{latest.sensor.name}</b>
                            </div>

                            <div className="big-number">
                                {latest.reading.water_level_m}
                                <small> m water level</small>
                            </div>

                            <div className="metric-row">
                                <span>
                                    Battery:{' '}
                                    {latest.reading.battery_v ?? '—'} V
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="empty">
                            Waiting for real telemetry from a registered sensor…
                        </div>
                    )}

                    <div className="section-head mt">
                        <div>
                            <span className="eyebrow">
                                RECENT ALERTS
                            </span>

                            <h2>Event history</h2>
                        </div>
                    </div>

                    {alerts.slice(0, 8).map(a => (
                        <div
                            className="event-row"
                            key={a.id}
                        >
                            <StatusPill level={a.level} />

                            <span>{a.title}</span>

                            <small>
                                {formatTimeIST(a.created_at)}
                            </small>
                        </div>
                    ))}
                </section>
            </div>
        </Layout>
    );
}