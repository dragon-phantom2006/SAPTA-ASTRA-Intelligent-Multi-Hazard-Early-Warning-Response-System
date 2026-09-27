import argparse,requests,json
p=argparse.ArgumentParser(); p.add_argument("--base-url",required=True); p.add_argument("--sensor-id",required=True); p.add_argument("--device-key",required=True); a=p.parse_args()
while True:
    raw=input("water_level_m (q to quit): ").strip()
    if raw.lower()=="q": break
    data={"sensor_id":a.sensor_id,"water_level_m":float(raw)}
    pressure=input("pressure_kpa [blank]: ").strip(); battery=input("battery_v [blank]: ").strip()
    if pressure: data["pressure_kpa"]=float(pressure)
    if battery: data["battery_v"]=float(battery)
    r=requests.post(a.base_url.rstrip("/")+"/api/v1/telemetry",headers={"X-Device-Key":a.device_key},json=data,timeout=10)
    print(r.status_code); print(json.dumps(r.json(),indent=2))
