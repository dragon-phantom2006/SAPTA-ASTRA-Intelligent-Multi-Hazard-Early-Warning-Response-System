import {useEffect,useState} from 'react';

import Layout from '../components/Layout';

import API from '../services/api';

export default function AdminSensors(){

    const [items,setItems]=useState([]),[f,setF]=useState({sensor_id:'',name:'',latitude:'',longitude:'',state:'',level1_m:'',level2_m:'',level3_m:'',level4_m:''}),[key,setKey]=useState('');

    const load=()=>API.get('/admin/sensors').then(r=>setItems(r.data.sensors));

    useEffect(() => {
        load().catch(console.error);
    }, []);

    const set=k=>e=>setF({...f,[k]:e.target.value});

    async function add(e){
        e.preventDefault();
        const r=await API.post('/admin/sensors',{
            ...f,
            ...Object.fromEntries(
                ['latitude','longitude','level1_m','level2_m','level3_m','level4_m']
                .map(k=>[k,Number(f[k])])
            )
        });
        setKey(r.data.device_key);
        setF({
            sensor_id:'',
            name:'',
            latitude:'',
            longitude:'',
            state:'',
            level1_m:'',
            level2_m:'',
            level3_m:'',
            level4_m:''
        });
        load();
    }

    async function removeSensor(s){
        if(!window.confirm(`Delete sensor "${s.name}" (${s.sensor_id})? This will stop the sensor from being accepted by the backend.`)) return;

        try{
            await API.delete(`/admin/sensors/${s.id}`);
            load();
        }catch(err){
            window.alert(err.response?.data?.error || 'Failed to delete sensor.');
        }
    }

    return (
        <Layout admin>
            <div className="two-col">
                <form className="panel" onSubmit={add}>
                    <span className="eyebrow">HARDWARE REGISTRATION</span>
                    <h2>Register physical sensor</h2>
                    <p className="muted">Thresholds are configured per physical position.</p>

                    {Object.keys(f).map(k=>
                        <label key={k}>
                            {k.replaceAll('_',' ')}
                            <input
                                className="plain-input"
                                value={f[k]}
                                onChange={set(k)}
                                required
                            />
                        </label>
                    )}

                    <button className="primary">Register sensor</button>

                    {key&&
                        <div className="key-box">
                            <b>Copy this device key into the ESP32 firmware now:</b>
                            <code>{key}</code>
                        </div>
                    }
                </form>

                <section className="panel">
                    <span className="eyebrow">REGISTERED NETWORK</span>
                    <h2>{items.length} sensors</h2>

                    {items.map(s=>
                        <div className="sensor-row" key={s.id}>
                            <div>
                                <b>{s.name}</b>
                                <small>{s.sensor_id} • {s.latitude}, {s.longitude}</small>
                            </div>

                            <div>
                                <span>L1 {s.thresholds.level1_m}m</span>
                                <span>L2 {s.thresholds.level2_m}m</span>
                                <span>L3 {s.thresholds.level3_m}m</span>
                                <span>L4 {s.thresholds.level4_m}m</span>

                                <button
                                    type="button"
                                    className="danger-button"
                                    onClick={()=>removeSensor(s)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
}