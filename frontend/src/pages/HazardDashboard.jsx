import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    Clock3,
    Gauge,
    MapPin,
    Radio,
    ShieldCheck,
    Sparkles,
    Thermometer,
    Wind,
    Droplets,
    Factory,
    Flame,
    Mountain,
    RefreshCw,
    Map as MapIcon
} from 'lucide-react';

import {
    MapContainer,
    TileLayer,
    Circle,
    Marker,
    Popup
} from 'react-leaflet';

import L from 'leaflet';


const HAZARDS = {

    'forest-fire': {
        key: 'forest-fire',
        title: 'Forest Fire Intelligence',
        short: 'Forest Fire',
        eyebrow: 'WILDFIRE EARLY DETECTION',
        icon: Flame,

        accent: '#E85D2A',
        accentDark: '#9E3215',
        soft: '#FFF0E9',
        glow: '#FFE0D2',

        description:
            'Monitor heat, smoke and vegetation-risk signals to identify emerging wildfire conditions before they spread.',

        metrics: [
            ['Thermal anomaly', 'Pending', '°C'],
            ['Smoke index', 'Pending', 'AQI'],
            ['Wind speed', 'Pending', 'km/h'],
            ['Fire-risk score', 'Pending', '/100']
        ],

        sensors: [
            'Thermal camera',
            'Smoke / PM sensor',
            'Ambient weather node',
            'Wind sensor'
        ],

        actions: [
            'Thermal anomaly detection',
            'Smoke concentration tracking',
            'Wind-driven spread assessment',
            'Evacuation alert readiness'
        ],

        levels: [
            ['NORMAL', 'No immediate fire indicators', 'Continuous monitoring'],
            ['WATCH', 'Environmental conditions becoming favorable', 'Increase observation'],
            ['WARNING', 'Multiple fire-risk signals detected', 'Prepare local response'],
            ['CRITICAL', 'Confirmed high-risk fire conditions', 'Activate emergency response']
        ]
    },


    temperature: {
        key: 'temperature',
        title: 'Temperature Intelligence',
        short: 'Temperature',
        eyebrow: 'THERMAL ENVIRONMENT MONITORING',
        icon: Thermometer,

        accent: '#E59A24',
        accentDark: '#A96508',
        soft: '#FFF7E4',
        glow: '#FFE7B5',

        description:
            'Track localized temperature patterns, heat stress and sudden thermal changes across monitored zones.',

        metrics: [
            ['Ambient temperature', 'Pending', '°C'],
            ['Heat index', 'Pending', '°C'],
            ['Humidity', 'Pending', '%'],
            ['Thermal risk', 'Pending', '/100']
        ],

        sensors: [
            'Digital temperature node',
            'Humidity sensor',
            'Weather station',
            'Remote thermal probe'
        ],

        actions: [
            'Heat-wave trend detection',
            'Thermal anomaly tracking',
            'Humidity correlation',
            'Public heat advisory readiness'
        ],

        levels: [
            ['NORMAL', 'Stable temperature range', 'Routine monitoring'],
            ['WATCH', 'Persistent temperature rise', 'Increase observation'],
            ['WARNING', 'Heat-stress conditions developing', 'Prepare advisories'],
            ['CRITICAL', 'Severe thermal conditions', 'Activate heat response']
        ]
    },


    'air-pollution': {
        key: 'air-pollution',
        title: 'Air Pollution Intelligence',
        short: 'Air Pollution',
        eyebrow: 'AIR QUALITY MONITORING',
        icon: Wind,

        accent: '#7B8496',
        accentDark: '#4E5667',
        soft: '#EEF0F4',
        glow: '#D8DCE5',

        description:
            'Combine particulate and gaseous pollutant measurements into a localized air-quality risk picture.',

        metrics: [
            ['PM2.5', 'Pending', 'µg/m³'],
            ['PM10', 'Pending', 'µg/m³'],
            ['AQI', 'Pending', 'index'],
            ['Pollution risk', 'Pending', '/100']
        ],

        sensors: [
            'PM2.5 / PM10 node',
            'CO / NO₂ sensor',
            'VOC sensor',
            'Weather node'
        ],

        actions: [
            'Particulate monitoring',
            'Gas concentration tracking',
            'AQI trend analysis',
            'Health advisory readiness'
        ],

        levels: [
            ['NORMAL', 'Air quality within monitored baseline', 'Routine monitoring'],
            ['WATCH', 'Pollutant concentration rising', 'Increase sampling'],
            ['WARNING', 'Unhealthy pollution pattern', 'Issue local advisory'],
            ['CRITICAL', 'Severe pollution event', 'Activate response protocol']
        ]
    },


    landslide: {
        key: 'landslide',
        title: 'Landslide Intelligence',
        short: 'Landslide',
        eyebrow: 'SLOPE STABILITY MONITORING',
        icon: Mountain,

        accent: '#8A5A3B',
        accentDark: '#613A24',
        soft: '#F4ECE6',
        glow: '#E6D2C3',

        description:
            'Watch rainfall, ground movement, pore pressure and slope conditions for early landslide-risk signals.',

        metrics: [
            ['Ground movement', 'Pending', 'mm'],
            ['Pore pressure', 'Pending', 'kPa'],
            ['Rainfall', 'Pending', 'mm/h'],
            ['Slope risk', 'Pending', '/100']
        ],

        sensors: [
            'Inclinometer',
            'Pore-pressure sensor',
            'Rain gauge',
            'Ground displacement node'
        ],

        actions: [
            'Slope movement tracking',
            'Pore-pressure analysis',
            'Rainfall accumulation',
            'Evacuation-zone readiness'
        ],

        levels: [
            ['NORMAL', 'Stable slope indicators', 'Routine monitoring'],
            ['WATCH', 'Early movement or rainfall signal', 'Increase sampling'],
            ['WARNING', 'Multiple instability indicators', 'Prepare evacuation'],
            ['CRITICAL', 'Rapid slope instability detected', 'Activate emergency response']
        ]
    },


    'water-quality': {
        key: 'water-quality',
        title: 'Water Quality Intelligence',
        short: 'Water Quality',
        eyebrow: 'AQUATIC HEALTH MONITORING',
        icon: Droplets,

        accent: '#1597B8',
        accentDark: '#09677F',
        soft: '#E8F8FC',
        glow: '#C7EEF6',

        description:
            'Track water chemistry and physical conditions to identify contamination or unsafe-water events.',

        metrics: [
            ['pH', 'Pending', 'pH'],
            ['Turbidity', 'Pending', 'NTU'],
            ['Dissolved oxygen', 'Pending', 'mg/L'],
            ['Quality risk', 'Pending', '/100']
        ],

        sensors: [
            'pH probe',
            'Turbidity sensor',
            'DO sensor',
            'Conductivity node'
        ],

        actions: [
            'Chemical parameter tracking',
            'Turbidity change detection',
            'Dissolved oxygen monitoring',
            'Water-safety advisory readiness'
        ],

        levels: [
            ['NORMAL', 'Parameters within monitored baseline', 'Routine sampling'],
            ['WATCH', 'Parameter drift detected', 'Increase sampling'],
            ['WARNING', 'Potential contamination pattern', 'Issue local advisory'],
            ['CRITICAL', 'Unsafe-water conditions detected', 'Activate water response']
        ]
    },


    'industrial-emission': {
        key: 'industrial-emission',
        title: 'Industrial Emission Intelligence',
        short: 'Industrial Emission',
        eyebrow: 'INDUSTRIAL AIR & STACK MONITORING',
        icon: Factory,

        accent: '#B94D68',
        accentDark: '#7E2940',
        soft: '#FBECEF',
        glow: '#F3CED8',

        description:
            'Monitor industrial emission indicators and surrounding air conditions for abnormal release patterns.',

        metrics: [
            ['SO₂', 'Pending', 'ppm'],
            ['NOx', 'Pending', 'ppm'],
            ['CO', 'Pending', 'ppm'],
            ['Emission risk', 'Pending', '/100']
        ],

        sensors: [
            'Stack gas analyzer',
            'SO₂ / NOx sensor',
            'CO sensor',
            'Ambient air node'
        ],

        actions: [
            'Stack emission tracking',
            'Gas concentration analysis',
            'Ambient impact monitoring',
            'Industrial incident readiness'
        ],

        levels: [
            ['NORMAL', 'Emission pattern within baseline', 'Routine compliance monitoring'],
            ['WATCH', 'Abnormal trend emerging', 'Increase sampling'],
            ['WARNING', 'Significant emission anomaly', 'Notify response team'],
            ['CRITICAL', 'Major release indicators', 'Activate emergency protocol']
        ]
    }
};


/*
 * Hazard-specific map marker.
 * The coordinates are intentionally generic until real
 * hazard-specific sensors are connected.
 */
function createHazardIcon(accent) {
    return L.divIcon({
        className: 'hazard-map-marker-wrapper',
        html: `
            <div
                class="hazard-map-marker"
                style="
                    --marker-color:${accent};
                    --marker-glow:${accent}55;
                "
            >
                <span></span>
            </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });
}


function Status({ label }) {
    return (
        <span className="hazard-status">
            <span />
            {label}
        </span>
    );
}


function HazardMap({ cfg, user }) {

    /*
     * Default India center.
     *
     * If the logged-in user's location is available,
     * the map will center around that location.
     */
    const latitude = Number(user?.latitude);
    const longitude = Number(user?.longitude);

    const hasUserLocation =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude);

    const center = hasUserLocation
        ? [latitude, longitude]
        : [22.9734, 78.6569];


    const markerIcon = createHazardIcon(cfg.accent);


    return (
        <section className="hazard-map-section">

            <div className="section-head">

                <div>
                    <span className="eyebrow">
                        GEOSPATIAL INTELLIGENCE
                    </span>

                    <h2>
                        {cfg.short} monitoring map
                    </h2>
                </div>

                <span className="hazard-map-label">
                    <MapIcon size={13} />
                    LIVE MAP
                </span>

            </div>


            <div
                className="hazard-map-frame"
                style={{
                    '--hazard-accent': cfg.accent,
                    '--hazard-soft': cfg.soft
                }}
            >

                <MapContainer
                    center={center}
                    zoom={hasUserLocation ? 11 : 5}
                    scrollWheelZoom={true}
                >

                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />


                    {/* Generic monitoring location */}
                    <Marker
                        position={center}
                        icon={markerIcon}
                    >
                        <Popup>

                            <strong>
                                {cfg.short} monitoring zone
                            </strong>

                            <br />

                            Monitoring network active

                            <br />

                            <small>
                                Connect hazard-specific sensors
                                to populate live telemetry.
                            </small>

                        </Popup>
                    </Marker>


                    {/* Soft hazard-radius visualization */}
                    <Circle
                        center={center}
                        radius={2500}
                        pathOptions={{
                            color: cfg.accent,
                            fillColor: cfg.accent,
                            fillOpacity: 0.08,
                            weight: 2
                        }}
                    />

                </MapContainer>


                <div className="hazard-map-overlay">

                    <div className="hazard-map-status">

                        <span
                            className="hazard-map-status-dot"
                            style={{
                                background: cfg.accent
                            }}
                        />

                        <div>
                            <b>Monitoring network</b>

                            <small>
                                Awaiting live {cfg.short.toLowerCase()} telemetry
                            </small>
                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}


export default function HazardDashboard({ type }) {

    const cfg =
        HAZARDS[type] ||
        HAZARDS['temperature'];

    const { user } = useAuth();

    const [activeTab, setActiveTab] =
        useState('overview');

    const [refreshed, setRefreshed] =
        useState(false);


    const Icon = cfg.icon;

    const role =
        user?.role === 'admin'
            ? 'ADMIN COMMAND'
            : 'COMMUNITY VIEW';


    const summary = useMemo(
        () => ({
            monitored: cfg.sensors.length,
            alerts: 0,
            readiness: 'READY',
            last: 'Waiting for live telemetry'
        }),
        [cfg]
    );


    return (
        <Layout admin={user?.role === 'admin'}>

            <div
                className={`hazard-page hazard-${cfg.key}`}
                style={{
                    '--hazard-accent': cfg.accent,
                    '--hazard-accent-dark': cfg.accentDark,
                    '--hazard-soft': cfg.soft,
                    '--hazard-glow': cfg.glow
                }}
            >

                {/* HERO */}

                <section className="hazard-hero">

                    <div className="hazard-hero-copy">

                        <div className="hazard-icon">
                            <Icon size={30} />
                        </div>

                        <div>

                            <span className="eyebrow">
                                {cfg.eyebrow}
                            </span>

                            <h2>{cfg.title}</h2>

                            <p>
                                {cfg.description}
                            </p>

                            <div className="hazard-meta">

                                <Status label="LIVE PIPELINE" />

                                <span>
                                    <Radio size={14} />
                                    {role}
                                </span>

                                <span>
                                    <Clock3 size={14} />
                                    {summary.last}
                                </span>

                            </div>

                        </div>

                    </div>


                    <div className="hazard-hero-badge">

                        <Sparkles size={17} />

                        <span>
                            LIVE
                        </span>

                        <b>
                            HAZARD INTELLIGENCE
                        </b>

                    </div>

                </section>


                {/* TABS */}

                <div
                    className="hazard-tabs"
                    role="tablist"
                >

                    {[
                        'overview',
                        'monitoring',
                        'response'
                    ].map(tab => (

                        <button
                            key={tab}
                            className={
                                activeTab === tab
                                    ? 'active'
                                    : ''
                            }
                            onClick={() =>
                                setActiveTab(tab)
                            }
                        >

                            {tab === 'overview'
                                ? 'Overview'
                                : tab === 'monitoring'
                                    ? 'Monitoring'
                                    : 'Response plan'}

                        </button>

                    ))}

                </div>


                {/* OVERVIEW */}

                {activeTab === 'overview' && (
                    <>

                        <section className="hazard-metrics">

                            {cfg.metrics.map(
                                ([name, value, unit]) => (

                                    <article
                                        className="hazard-metric"
                                        key={name}
                                    >

                                        <span>
                                            {name}
                                        </span>

                                        <strong>
                                            {value}
                                        </strong>

                                        <small>
                                            {unit}
                                        </small>

                                        <div className="metric-line">
                                            <i />
                                        </div>

                                    </article>

                                )
                            )}

                        </section>


                        {/* MAP */}

                        <HazardMap
                            cfg={cfg}
                            user={user}
                        />


                        <section className="hazard-columns">

                            <div className="panel hazard-panel">

                                <div className="section-head">

                                    <div>

                                        <span className="eyebrow">
                                            DETECTION NETWORK
                                        </span>

                                        <h2>
                                            Monitored signals
                                        </h2>

                                    </div>

                                    <span className="live-badge">
                                        {summary.monitored} NODES
                                    </span>

                                </div>


                                <div className="sensor-list">

                                    {cfg.sensors.map(
                                        (sensor, index) => (

                                            <div
                                                className="hazard-sensor"
                                                key={sensor}
                                            >

                                                <span className="sensor-number">
                                                    0{index + 1}
                                                </span>

                                                <div>

                                                    <b>
                                                        {sensor}
                                                    </b>

                                                    <small>
                                                        Awaiting live connection
                                                    </small>

                                                </div>

                                                <CheckCircle2 size={18} />

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>


                            <div className="panel hazard-panel">

                                <div className="section-head">

                                    <div>

                                        <span className="eyebrow">
                                            OPERATIONAL STATUS
                                        </span>

                                        <h2>
                                            Risk engine
                                        </h2>

                                    </div>

                                    <Gauge size={21} />

                                </div>


                                <div className="risk-score">

                                    <div>

                                        <span>
                                            Current risk
                                        </span>

                                        <strong>
                                            —
                                        </strong>

                                    </div>

                                    <div className="risk-gauge">
                                        <i />
                                    </div>

                                </div>


                                <div className="status-grid">

                                    <div>

                                        <span>
                                            Alert records
                                        </span>

                                        <b>
                                            {summary.alerts}
                                        </b>

                                    </div>

                                    <div>

                                        <span>
                                            Response readiness
                                        </span>

                                        <b>
                                            {summary.readiness}
                                        </b>

                                    </div>

                                </div>


                                <button
                                    className="secondary-btn"
                                    onClick={() => {

                                        setRefreshed(true);

                                        setTimeout(
                                            () =>
                                                setRefreshed(false),
                                            1400
                                        );

                                    }}
                                >

                                    <RefreshCw
                                        size={16}
                                        className={
                                            refreshed
                                                ? 'spin'
                                                : ''
                                        }
                                    />

                                    {refreshed
                                        ? 'Pipeline checked'
                                        : 'Check live pipeline'}

                                </button>

                            </div>

                        </section>

                    </>
                )}


                {/* MONITORING */}

                {activeTab === 'monitoring' && (

                    <section className="hazard-columns">

                        <div className="panel hazard-panel">

                            <div className="section-head">

                                <div>

                                    <span className="eyebrow">
                                        DATA ACQUISITION
                                    </span>

                                    <h2>
                                        Sensor architecture
                                    </h2>

                                </div>

                                <Activity size={21} />

                            </div>


                            <div className="architecture-grid">

                                {cfg.actions.map(
                                    (action, index) => (

                                        <div key={action}>

                                            <span>
                                                {String(index + 1).padStart(2, '0')}
                                            </span>

                                            <b>
                                                {action}
                                            </b>

                                            <small>
                                                Real-time stream • threshold engine • event history
                                            </small>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>


                        <div className="panel hazard-panel">

                            <div className="section-head">

                                <div>

                                    <span className="eyebrow">
                                        ANALYTICS
                                    </span>

                                    <h2>
                                        Signal pipeline
                                    </h2>

                                </div>

                                <BarChart3 size={21} />

                            </div>


                            <div className="pipeline">

                                <div>
                                    <span>01</span>
                                    <b>Acquire</b>
                                    <small>Sensor telemetry</small>
                                </div>

                                <div>
                                    <span>02</span>
                                    <b>Validate</b>
                                    <small>Quality checks</small>
                                </div>

                                <div>
                                    <span>03</span>
                                    <b>Analyze</b>
                                    <small>Risk features</small>
                                </div>

                                <div>
                                    <span>04</span>
                                    <b>Alert</b>
                                    <small>Actionable warning</small>
                                </div>

                            </div>

                        </div>

                    </section>

                )}


                {/* RESPONSE */}

                {activeTab === 'response' && (

                    <section className="panel hazard-panel">

                        <div className="section-head">

                            <div>

                                <span className="eyebrow">
                                    SEVERITY FRAMEWORK
                                </span>

                                <h2>
                                    {cfg.short} response levels
                                </h2>

                            </div>

                            <ShieldCheck size={22} />

                        </div>


                        <div className="severity-list">

                            {cfg.levels.map(
                                ([level, meaning, action], index) => (

                                    <div
                                        className={
                                            `severity severity-${index + 1}`
                                        }
                                        key={level}
                                    >

                                        <div className="severity-index">
                                            L{index + 1}
                                        </div>

                                        <div>

                                            <b>
                                                {level}
                                            </b>

                                            <span>
                                                {meaning}
                                            </span>

                                        </div>

                                        <strong>
                                            {action}
                                        </strong>

                                        <AlertTriangle size={18} />

                                    </div>

                                )
                            )}

                        </div>

                    </section>

                )}


                {/* FOOTER */}

                <section className="hazard-footer-note">

                    <MapPin size={18} />

                    <div>

                        <b>
                            Location-aware intelligence
                        </b>

                        <span>
                            {user?.state
                                ? `Monitoring context for ${user.state}.`
                                : `Connect the ${cfg.short.toLowerCase()} sensor network to populate location-specific telemetry.`}
                        </span>

                    </div>

                </section>

            </div>

        </Layout>
    );
}
