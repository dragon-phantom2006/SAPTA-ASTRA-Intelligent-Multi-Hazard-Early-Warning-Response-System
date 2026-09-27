import requests

def resolve_indian_state(latitude, longitude):
    try:
        r = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={
                "lat": latitude,
                "lon": longitude,
                "format": "json",
                "zoom": 10,
                "addressdetails": 1,
            },
            headers={"User-Agent": "FloodGuard/1.0"},
            timeout=8,
        )
        r.raise_for_status()
        address = r.json().get("address", {})
        return address.get("state") or address.get("state_district") or None
    except Exception:
        return None
