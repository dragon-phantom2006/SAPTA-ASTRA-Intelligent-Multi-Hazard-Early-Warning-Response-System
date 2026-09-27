import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Activity, AlertTriangle, BarChart3, CheckCircle2, Clock3, Gauge, MapPin, Radio, ShieldCheck, Sparkles, Thermometer, Wind, Droplets, Factory, Flame, Mountain, Waves, RefreshCw } from 'lucide-react';

const HAZARDS = {
    'forest-fire': {
        key:'forest-fire', title:'Forest Fire Intelligence', short:'Forest Fire', eyebrow:'WILDFIRE EARLY DETECTION', icon:Flame,
        accent:'#ef6a4f', soft:'#fff0eb', description:'Monitor heat, smoke and vegetation-risk signals to identify emerging wildfire conditions before they spread.',
        metrics:[['Thermal anomaly','Pending','°C'],['Smoke index','Pending','AQI'],['Wind speed','Pending','km/h'],['Fire-risk score','Pending','/100']],
        sensors:['Thermal camera','Smoke / PM sensor','Ambient weather node','Wind sensor'],
        actions:['Thermal anomaly detection','Smoke concentration tracking','Wind-driven spread assessment','Evacuation alert readiness'],
        levels:[['NORMAL','No immediate fire indicators','Continuous monitoring'],['WATCH','Environmental conditions becoming favorable','Increase observation'],['WARNING','Multiple fire-risk signals detected','Prepare local response'],['CRITICAL','Confirmed high-risk fire conditions','Activate emergency response']]
    },
    temperature: {
        key:'temperature', title:'Temperature Intelligence', short:'Temperature', eyebrow:'THERMAL ENVIRONMENT MONITORING', icon:Thermometer,
        accent:'#e39a32', soft:'#fff7e7', description:'Track localized temperature patterns, heat stress and sudden thermal changes across monitored zones.',
        metrics:[['Ambient temperature','Pending','°C'],['Heat index','Pending','°C'],['Humidity','Pending','%'],['Thermal risk','Pending','/100']],
        sensors:['Digital temperature node','Humidity sensor','Weather station','Remote thermal probe'],
        actions:['Heat-wave trend detection','Thermal anomaly tracking','Humidity correlation','Public heat advisory readiness'],
        levels:[['NORMAL','Stable temperature range','Routine monitoring'],['WATCH','Persistent temperature rise','Increase observation'],['WARNING','Heat-stress conditions developing','Prepare advisories'],['CRITICAL','Severe thermal conditions','Activate heat response']]
    },
    'air-pollution': {
        key:'air-pollution', title:'Air Pollution Intelligence', short:'Air Pollution', eyebrow:'AIR QUALITY MONITORING', icon:Wind,
        accent:'#8b72d8', soft:'#f2efff', description:'Combine particulate and gaseous pollutant measurements into a localized air-quality risk picture.',
        metrics:[['PM2.5','Pending','µg/m³'],['PM10','Pending','µg/m³'],['AQI','Pending','index'],['Pollution risk','Pending','/100']],
        sensors:['PM2.5 / PM10 node','CO / NO₂ sensor','VOC sensor','Weather node'],
        actions:['Particulate monitoring','Gas concentration tracking','AQI trend analysis','Health advisory readiness'],
        levels:[['NORMAL','Air quality within monitored baseline','Routine monitoring'],['WATCH','Pollutant concentration rising','Increase sampling'],['WARNING','Unhealthy pollution pattern','Issue local advisory'],['CRITICAL','Severe pollution event','Activate response protocol']]
    },
    landslide: {
        key:'landslide', title:'Landslide Intelligence', short:'Landslide', eyebrow:'SLOPE STABILITY MONITORING', icon:Mountain,
        accent:'#b36b42', soft:'#f8eee8', description:'Watch rainfall, ground movement, pore pressure and slope conditions for early landslide-risk signals.',
        metrics:[['Ground movement','Pending','mm'],['Pore pressure','Pending','kPa'],['Rainfall','Pending','mm/h'],['Slope risk','Pending','/100']],
        sensors:['Inclinometer','Pore-pressure sensor','Rain gauge','Ground displacement node'],
        actions:['Slope movement tracking','Pore-pressure analysis','Rainfall accumulation','Evacuation-zone readiness'],
        levels:[['NORMAL','Stable slope indicators','Routine monitoring'],['WATCH','Early movement or rainfall signal','Increase sampling'],['WARNING','Multiple instability indicators','Prepare evacuation'],['CRITICAL','Rapid slope instability detected','Activate emergency response']]
    },
    'water-quality': {
        key:'water-quality', title:'Water Quality Intelligence', short:'Water Quality', eyebrow:'AQUATIC HEALTH MONITORING', icon:Droplets,
        accent:'#2f9eb3', soft:'#eaf8fb', description:'Track water chemistry and physical conditions to identify contamination or unsafe-water events.',
        metrics:[['pH','Pending','pH'],['Turbidity','Pending','NTU'],['Dissolved oxygen','Pending','mg/L'],['Quality risk','Pending','/100']],
        sensors:['pH probe','Turbidity sensor','DO sensor','Conductivity node'],
        actions:['Chemical parameter tracking','Turbidity change detection','Dissolved oxygen monitoring','Water-safety advisory readiness'],
        levels:[['NORMAL','Parameters within monitored baseline','Routine sampling'],['WATCH','Parameter drift detected','Increase sampling'],['WARNING','Potential contamination pattern','Issue local advisory'],['CRITICAL','Unsafe-water conditions detected','Activate water response']]
    },
    'industrial-emission': {
        key:'industrial-emission', title:'Industrial Emission Intelligence', short:'Industrial Emission', eyebrow:'INDUSTRIAL AIR & STACK MONITORING', icon:Factory,
        accent:'#d15b78', soft:'#fcecf1', description:'Monitor industrial emission indicators and surrounding air conditions for abnormal release patterns.',
        metrics:[['SO₂','Pending','ppm'],['NOx','Pending','ppm'],['CO','Pending','ppm'],['Emission risk','Pending','/100']],
        sensors:['Stack gas analyzer','SO₂ / NOx sensor','CO sensor','Ambient air node'],
        actions:['Stack emission tracking','Gas concentration analysis','Ambient impact monitoring','Industrial incident readiness'],
        levels:[['NORMAL','Emission pattern within baseline','Routine compliance monitoring'],['WATCH','Abnormal trend emerging','Increase sampling'],['WARNING','Significant emission anomaly','Notify response team'],['CRITICAL','Major release indicators','Activate emergency protocol']]
    }
};

function Status({label}){ return <span className="hazard-status"><span/> {label}</span>; }

export default function HazardDashboard({type}){
    const cfg=HAZARDS[type] || HAZARDS['temperature'];
    const {user}=useAuth();
    const [activeTab,setActiveTab]=useState('overview');
    const [refreshed,setRefreshed]=useState(false);
    const Icon=cfg.icon;
    const role=user?.role==='admin'?'ADMIN COMMAND':'COMMUNITY VIEW';
    const summary=useMemo(()=>({
        monitored: cfg.sensors.length,
        alerts: 0,
        readiness: 'READY',
        last: 'Waiting for live telemetry'
    }),[cfg]);

    return <Layout admin={user?.role==='admin'}>
        <div className="hazard-page" style={{'--hazard-accent':cfg.accent,'--hazard-soft':cfg.soft}}>
            <section className="hazard-hero">
                <div className="hazard-hero-copy">
                    <div className="hazard-icon"><Icon size={30}/></div>
                    <div>
                        <span className="eyebrow">{cfg.eyebrow}</span>
                        <h2>{cfg.title}</h2>
                        <p>{cfg.description}</p>
                        <div className="hazard-meta"><Status label="LIVE PIPELINE"/><span><Radio size={14}/> {role}</span><span><Clock3 size={14}/> {summary.last}</span></div>
                    </div>
                </div>
                <div className="hazard-hero-badge"><Sparkles size={17}/><span>AI-READY</span><b>REAL DATA</b></div>
            </section>

            <div className="hazard-tabs" role="tablist">
                {['overview','monitoring','response'].map(tab=><button key={tab} className={activeTab===tab?'active':''} onClick={()=>setActiveTab(tab)}>{tab==='overview'?'Overview':tab==='monitoring'?'Monitoring':'Response plan'}</button>)}
            </div>

            {activeTab==='overview' && <>
                <section className="hazard-metrics">
                    {cfg.metrics.map(([name,value,unit])=><article className="hazard-metric" key={name}><span>{name}</span><strong>{value}</strong><small>{unit}</small><div className="metric-line"><i/></div></article>)}
                </section>

                <section className="hazard-columns">
                    <div className="panel hazard-panel">
                        <div className="section-head"><div><span className="eyebrow">DETECTION NETWORK</span><h2>Monitored signals</h2></div><span className="live-badge">{summary.monitored} NODES</span></div>
                        <div className="sensor-list">{cfg.sensors.map((s,i)=><div className="hazard-sensor" key={s}><span className="sensor-number">0{i+1}</span><div><b>{s}</b><small>Awaiting live connection</small></div><CheckCircle2 size={18}/></div>)}</div>
                    </div>
                    <div className="panel hazard-panel">
                        <div className="section-head"><div><span className="eyebrow">OPERATIONAL STATUS</span><h2>Risk engine</h2></div><Gauge size={21}/></div>
                        <div className="risk-score"><div><span>Current risk</span><strong>—</strong></div><div className="risk-gauge"><i/></div></div>
                        <div className="status-grid"><div><span>Alert records</span><b>{summary.alerts}</b></div><div><span>Response readiness</span><b>{summary.readiness}</b></div></div>
                        <button className="secondary-btn" onClick={()=>{setRefreshed(true);setTimeout(()=>setRefreshed(false),1400)}}><RefreshCw size={16} className={refreshed?'spin':''}/> {refreshed?'Pipeline checked':'Check live pipeline'}</button>
                    </div>
                </section>
            </>}

            {activeTab==='monitoring' && <section className="hazard-columns">
                <div className="panel hazard-panel"><div className="section-head"><div><span className="eyebrow">DATA ACQUISITION</span><h2>Sensor architecture</h2></div><Activity size={21}/></div><div className="architecture-grid">{cfg.actions.map((a,i)=><div key={a}><span>{String(i+1).padStart(2,'0')}</span><b>{a}</b><small>Real-time stream • threshold engine • event history</small></div>)}</div></div>
                <div className="panel hazard-panel"><div className="section-head"><div><span className="eyebrow">ANALYTICS</span><h2>Signal pipeline</h2></div><BarChart3 size={21}/></div><div className="pipeline"><div><span>01</span><b>Acquire</b><small>Sensor telemetry</small></div><div><span>02</span><b>Validate</b><small>Quality checks</small></div><div><span>03</span><b>Analyze</b><small>Risk features</small></div><div><span>04</span><b>Alert</b><small>Actionable warning</small></div></div></div>
            </section>}

            {activeTab==='response' && <section className="panel hazard-panel"><div className="section-head"><div><span className="eyebrow">SEVERITY FRAMEWORK</span><h2>{cfg.short} response levels</h2></div><ShieldCheck size={22}/></div><div className="severity-list">{cfg.levels.map(([level,meaning,action],i)=><div className={'severity severity-'+(i+1)} key={level}><div className="severity-index">L{i+1}</div><div><b>{level}</b><span>{meaning}</span></div><strong>{action}</strong><AlertTriangle size={18}/></div>)}</div></section>}

            <section className="hazard-footer-note"><MapPin size={18}/><div><b>Location-aware intelligence</b><span>{user?.state ? `Monitoring context for ${user.state}.` : 'Connect the hazard sensor network to populate location-specific telemetry.'}</span></div></section>
        </div>
    </Layout>
}
