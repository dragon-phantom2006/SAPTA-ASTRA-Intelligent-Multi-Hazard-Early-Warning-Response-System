import {useEffect,useRef,useState} from 'react';
import Layout from '../components/Layout';
import LiveMap from '../components/LiveMap';
import AlertCard from '../components/AlertCard';
import {useAuth} from '../contexts/AuthContext';
import API from '../services/api';
import {connectSocket} from '../services/socket';
import {registerForPushNotifications,listenForForegroundMessages} from '../services/firebase';

export default function MemberDashboard(){
    const {user}=useAuth();
    const [alerts,setAlerts]=useState([]);
    const [locations,setLocations]=useState([]);
    const [zones,setZones]=useState([]);
    const [pos,setPos]=useState(null);
    const [notes,setNotes]=useState([]);
    const [mode,setMode]=useState(user?.location_mode||'manual');
    const [manualLat,setManualLat]=useState(user?.latitude??'');
    const [manualLng,setManualLng]=useState(user?.longitude??'');
    const [locationError,setLocationError]=useState('');
    const [mobile,setMobile]=useState(
        user?.mobile?.startsWith('google_')?'':(user?.mobile||'')
    );
    const [mobileMessage,setMobileMessage]=useState('');
    const watchRef=useRef(null);

    useEffect(()=>{
        setMode(user?.location_mode||'manual');
        setManualLat(user?.latitude??'');
        setManualLng(user?.longitude??'');

        if(user?.mobile && !user.mobile.startsWith('google_')){
            setMobile(user.mobile);
        }
    },[user]);

    useEffect(()=>{
        API.get('/member/dashboard').then(r=>{
            setNotes(r.data.notifications);
            if(r.data.user){
                setMode(r.data.user.location_mode||'manual');
                if(r.data.user.latitude!=null)setManualLat(r.data.user.latitude);
                if(r.data.user.longitude!=null)setManualLng(r.data.user.longitude);

                if(
                    r.data.user.mobile &&
                    !r.data.user.mobile.startsWith('google_')
                ){
                    setMobile(r.data.user.mobile);
                }
            }
        });

        registerForPushNotifications().then(token=>{
            if(token)API.post('/member/device-token',{token}).catch(()=>{});
        }).catch(()=>{});

        let stopMessage=()=>{};
        listenForForegroundMessages(payload=>{
            const data=payload.data||{};
            if(data.vibration==='true' && 'vibrate' in navigator) navigator.vibrate([500,250,500]);
            API.get('/member/dashboard').then(r=>setNotes(r.data.notifications));
            loadFloodData();
        }).then(stop=>{stopMessage=stop||(()=>{});});

        const s=connectSocket(localStorage.getItem('floodguard_token'));
        s.on('notification:new',n=>{
            if(n.vibration && 'vibrate' in navigator) navigator.vibrate([500,250,500]);
            setNotes(prev=>[n,...prev].slice(0,20));
            loadFloodData();
        });

        return()=>{
            stopMessage();
            s.disconnect();
            if(watchRef.current!=null)navigator.geolocation?.clearWatch(watchRef.current);
        };
    },[]);

    useEffect(()=>{
        if(mode!=='live')return;
        if(!navigator.geolocation){
            setLocationError('Live location is not supported by this browser.');
            return;
        }

        setLocationError('');
        watchRef.current=navigator.geolocation.watchPosition(
            p=>{
                const next={lat:p.coords.latitude,lng:p.coords.longitude};
                setPos(next);
                setManualLat(next.lat);
                setManualLng(next.lng);
                API.put('/member/profile/location',{
                    latitude:next.lat,
                    longitude:next.lng,
                    location_mode:'live'
                }).catch(()=>{});
            },
            ()=>setLocationError('Live location permission was denied or unavailable.'),
            {enableHighAccuracy:true,maximumAge:10000,timeout:15000}
        );

        return()=>{
            if(watchRef.current!=null){
                navigator.geolocation.clearWatch(watchRef.current);
                watchRef.current=null;
            }
        };
    },[mode]);

    useEffect(()=>{
        if(mode==='manual'){
            const lat=Number(manualLat);
            const lng=Number(manualLng);
            if(Number.isFinite(lat)&&Number.isFinite(lng))setPos({lat,lng});
        }
    },[mode,manualLat,manualLng]);

    useEffect(()=>{
        loadFloodData();
    },[pos]);

    async function loadFloodData(){
        try{
            const [a,z]=await Promise.all([
                pos
                    ? API.get('/alerts/nearby',{params:{lat:pos.lat,lng:pos.lng}})
                    : Promise.resolve({data:{alerts:[]}}),
                API.get('/flood-zones')
            ]);
            setAlerts(a.data.alerts);
            setZones(z.data.zones);
            if(pos){
                const r=await API.get('/safe-locations/nearest',{
                    params:{lat:pos.lat,lng:pos.lng,limit:6}
                });
                setLocations(r.data.locations);
            }
        }catch{}
    }

    async function chooseMode(next){
        setMode(next);
        await API.put('/member/profile/location-mode',{
            location_mode:next
        }).catch(()=>{});

        if(next==='manual'){
            if(watchRef.current!=null){
                navigator.geolocation?.clearWatch(watchRef.current);
                watchRef.current=null;
            }

            const lat=Number(manualLat),lng=Number(manualLng);

            if(Number.isFinite(lat)&&Number.isFinite(lng)){
                setPos({lat,lng});
                await API.put('/member/profile/location',{
                    latitude:lat,
                    longitude:lng,
                    location_mode:'manual'
                }).catch(()=>{});
            }
        }
    }

    async function saveManualLocation(e){
        e.preventDefault();
        const lat=Number(manualLat),lng=Number(manualLng);

        if(
            !Number.isFinite(lat)||
            !Number.isFinite(lng)||
            lat<-90||
            lat>90||
            lng<-180||
            lng>180
        ){
            setLocationError('Enter valid latitude and longitude.');
            return;
        }

        setLocationError('');
        setPos({lat,lng});

        await API.put('/member/profile/location',{
            latitude:lat,
            longitude:lng,
            location_mode:'manual'
        }).catch(()=>setLocationError('Could not save the location.'));

        loadFloodData();
    }

    async function saveMobile(e){
        e.preventDefault();
        setMobileMessage('');

        const value=mobile.trim();

        if(!/^\d{10}$/.test(value)){
            setMobileMessage('Enter a valid 10-digit mobile number.');
            return;
        }

        try{
            const r=await API.put('/member/profile/mobile',{
                mobile:value
            });

            setMobile(r.data.user.mobile);
            setMobileMessage('Mobile number saved successfully.');
        }catch(err){
            setMobileMessage(
                err.response?.data?.error ||
                'Could not save mobile number.'
            );
        }
    }

    return <Layout>
        <section className="hero-strip">
            <div>
                <span className="eyebrow">YOUR LOCAL RISK VIEW</span>
                <h2>Stay informed, stay ready.</h2>
                <p>Flood alerts identify the affected Indian state. The map marks an active Level 1+ flood area in red.</p>
            </div>
            <div className="live-badge"><span className="live-dot"/> LIVE</div>
        </section>

        <section className="panel location-panel">
            <div className="section-head">
                <div>
                    <span className="eyebrow">CONTACT INFORMATION</span>
                    <h2>Registered mobile number</h2>
                </div>
            </div>

            <p className="muted">
                Add your real mobile number so administrators can send you direct flood warnings.
            </p>

            <form className="manual-location" onSubmit={saveMobile}>
                <label>
                    Mobile number
                    <input
                        className="plain-input"
                        type="tel"
                        value={mobile}
                        onChange={e=>setMobile(e.target.value)}
                        placeholder="e.g. 9876543210"
                        maxLength="10"
                        required
                    />
                </label>

                <button className="primary" type="submit">
                    Save mobile number
                </button>
            </form>

            {mobileMessage&&<div className="success">{mobileMessage}</div>}
        </section>

        <section className="panel location-panel">
            <div className="section-head">
                <div><span className="eyebrow">LOCATION MODE</span><h2>Choose how FloodGuard locates you</h2></div>
                <span className="muted">{user?.state||'State will be detected from your coordinates'}</span>
            </div>

            <div className="role-switch">
                <button type="button" className={mode==='live'?'selected':''} onClick={()=>chooseMode('live')}>Use live location</button>
                <button type="button" className={mode==='manual'?'selected':''} onClick={()=>chooseMode('manual')}>Use my coordinates</button>
            </div>

            {mode==='manual'&&<form className="manual-location" onSubmit={saveManualLocation}>
                <label>Latitude<input className="plain-input" value={manualLat} onChange={e=>setManualLat(e.target.value)} placeholder="e.g. 22.72" required/></label>
                <label>Longitude<input className="plain-input" value={manualLng} onChange={e=>setManualLng(e.target.value)} placeholder="e.g. 88.48" required/></label>
                <button className="primary">Save location</button>
            </form>}

            {locationError&&<div className="error">{locationError}</div>}
        </section>

        <div className="dashboard-grid">
            <section>
                <div className="section-head">
                    <div><span className="eyebrow">MAP GUIDANCE</span><h2>Nearby sensors & safe locations</h2></div>
                    <span className="muted">{pos?'Location active':'Location not available'}</span>
                </div>

                <LiveMap
                    alerts={alerts}
                    locations={locations}
                    userLocation={pos}
                    floodZones={zones}
                />
            </section>

            <section>
                <div className="section-head">
                    <div><span className="eyebrow">ALERT FEED</span><h2>Flood warnings</h2></div>
                </div>

                {alerts.length
                    ?alerts.map(a=><AlertCard key={a.id} a={a}/>)
                    :<div className="empty">No live alerts in your current radius.</div>}

                <div className="section-head mt">
                    <div><span className="eyebrow">NOTIFICATIONS</span><h2>India-wide messages</h2></div>
                </div>

                {notes.slice(0,10).map(n=>
                    <div className="notice" key={n.id}>
                        <b>{n.title}</b>
                        <p>{n.message}</p>
                    </div>
                )}
            </section>
        </div>
    </Layout>
}