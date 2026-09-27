import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
    const result = await signInWithPopup(firebaseAuth, provider);
    return result.user.getIdToken();
}

export async function firebaseLogout() {
    await signOut(firebaseAuth);
}

export async function registerForPushNotifications() {
    if (!("Notification" in window) || Notification.permission === "denied") return null;
    if (!(await isSupported())) return null;

    const permission = Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    if (permission !== "granted") return null;

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) return null;

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const messaging = getMessaging(app);

    return getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration
    });
}

export async function listenForForegroundMessages(callback) {
    if (!(await isSupported())) return () => {};
    const messaging = getMessaging(app);
    return onMessage(messaging, callback);
}
