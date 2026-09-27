import json
import os

_initialized = False

def init_firebase():
    global _initialized
    if _initialized:
        return True
    try:
        import firebase_admin
        from firebase_admin import credentials
        if firebase_admin._apps:
            _initialized = True
            return True
        raw = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
        path = os.getenv("FIREBASE_SERVICE_ACCOUNT_FILE", "").strip()
        if raw:
            cred = credentials.Certificate(json.loads(raw))
        elif path:
            cred = credentials.Certificate(path)
        else:
            return False
        firebase_admin.initialize_app(cred)
        _initialized = True
        return True
    except Exception:
        return False

def verify_google_token(id_token):
    if not init_firebase():
        raise RuntimeError("Firebase Admin is not configured.")
    from firebase_admin import auth
    return auth.verify_id_token(id_token)

def sync_member_to_firestore(user):
    if not init_firebase():
        return {"status": "not_configured"}
    try:
        from firebase_admin import firestore
        firestore.client().collection("members").document(str(user.id)).set(user.public(), merge=True)
        return {"status": "stored"}
    except Exception as exc:
        return {"status": "error", "error": str(exc)}
