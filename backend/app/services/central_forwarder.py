import os, requests, hmac, hashlib, json

def forward_event(payload):
    url=os.getenv("CENTRAL_WEBHOOK_URL")
    if not url: return {"status":"not_configured"}
    body=json.dumps(payload,separators=(",",":"))
    secret=os.getenv("CENTRAL_WEBHOOK_SECRET","")
    headers={"Content-Type":"application/json"}
    if secret: headers["X-FloodGuard-Signature"]=hmac.new(secret.encode(),body.encode(),hashlib.sha256).hexdigest()
    try:
        r=requests.post(url,data=body,headers=headers,timeout=5); r.raise_for_status(); return {"status":"forwarded","http_status":r.status_code}
    except Exception as e: return {"status":"error","error":str(e)}
