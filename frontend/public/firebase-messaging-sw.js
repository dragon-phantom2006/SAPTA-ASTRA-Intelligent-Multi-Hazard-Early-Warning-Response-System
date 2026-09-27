/* Replace the placeholder Firebase values with the same Firebase Web App
   configuration shown in frontend/.env before testing background push notifications. */
importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js");

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDcN-rwIO9dvHKDNO9nNYHJVb0lYolU1QM",
    authDomain: "brahmandaastra-1a956.firebaseapp.com",
    projectId: "brahmandaastra-1a956",
    storageBucket: "brahmandaastra-1a956.firebasestorage.app",
    messagingSenderId: "353906839033",
    appId: "1:353906839033:web:45bdd5cc7aecb62cc18128"
};

if (FIREBASE_CONFIG.apiKey !== "REPLACE_ME") {
    firebase.initializeApp(FIREBASE_CONFIG);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {};
    const notification = payload.notification || {};
    self.registration.showNotification(notification.title || "FloodGuard Alert", {
        body: notification.body || "Flood alert received.",
        icon: "/icon-192.png",
        vibrate: data.vibration === "true" ? [500, 250, 500] : [0],
        data
    });
    });
}
