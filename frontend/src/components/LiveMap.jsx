import React from 'react';
import {MapContainer,TileLayer,Marker,Popup,Circle,Polyline} from 'react-leaflet';
import L from 'leaflet';
import {useState} from 'react';

const icon=L.divIcon({
    className:'sensor-marker',
    html:'<span>⌁</span>',
    iconSize:[34,34],
    iconAnchor:[17,17]
});

export default function LiveMap({alerts=[],locations=[],userLocation=null,floodZones=[]}){
    const [route,setRoute]=useState([]);
    const center=userLocation
        ?[userLocation.lat,userLocation.lng]
        :(alerts[0]?[alerts[0].latitude,alerts[0].longitude]:[22.9734,78.6569]);

    async function getRoute(to){
        if(!userLocation)return;
        const base=import.meta.env.VITE_ROUTING_BASE_URL||'https://router.project-osrm.org';
        const u=`${base}/route/v1/driving/${userLocation.lng},${userLocation.lat};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;
        const r=await fetch(u);
        const d=await r.json();
        setRoute(d.routes?.[0]?.geometry?.coordinates?.map(([lng,lat])=>[lat,lng])||[]);
    }

    return <div className="map-wrap">
        <MapContainer center={center} zoom={6} scrollWheelZoom>
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

            {floodZones.map(z=><Circle
                key={`zone-${z.sensor_id}`}
                center={[z.latitude,z.longitude]}
                radius={1500}
                pathOptions={{
                    color:'#d71920',
                    fillColor:'#d71920',
                    fillOpacity:0.42,
                    weight:2
                }}
            >
                <Popup>
                    <b>Active flood area</b><br/>
                    State: {z.state}<br/>
                    Water level: {z.water_level_m} m<br/>
                    Level: {z.level}
                </Popup>
            </Circle>)}

            {alerts.map(a=><React.Fragment key={'alert-'+a.id}>
                <Marker position={[a.latitude,a.longitude]} icon={icon}>
                    <Popup>
                        <b>{a.title}</b><br/>
                        State: {a.state||'Unknown'}<br/>
                        Level {a.level}<br/>
                        {a.water_level_m} m
                    </Popup>
                </Marker>
                <Circle center={[a.latitude,a.longitude]} radius={1000+a.level*500} pathOptions={{className:'alert-ring'}}/>
            </React.Fragment>)}

            {locations.map(l=><Marker key={'s'+l.id} position={[l.latitude,l.longitude]}>
                <Popup>
                    <b>{l.name}</b><br/>
                    {l.address}<br/>
                    {l.distance_km!=null?`${l.distance_km} km away`:''}<br/>
                    <button onClick={()=>getRoute(l)}>Guide me</button>
                </Popup>
            </Marker>)}

            {userLocation&&<Marker position={[userLocation.lat,userLocation.lng]}>
                <Popup>Your selected location</Popup>
            </Marker>}

            {route.length>1&&<Polyline positions={route}/>}
        </MapContainer>
    </div>;
}
