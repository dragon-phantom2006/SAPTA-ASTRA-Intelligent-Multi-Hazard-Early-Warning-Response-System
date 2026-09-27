# FloodGuard Firebase setup

The modified project uses Firebase for:
- Google member authentication.
- Firestore storage of member profiles.
- Firebase Cloud Messaging (FCM) for push notifications.

## 1. Firebase project
Create a Firebase project in the Firebase Console.

Enable:
1. Authentication -> Sign-in method -> Google.
2. Firestore Database.
3. Cloud Messaging.

## 2. Web app
Register a Web App in the Firebase project and copy its configuration into:

`frontend/.env`

Use these variables:

`VITE_FIREBASE_API_KEY`
`VITE_FIREBASE_AUTH_DOMAIN`
`VITE_FIREBASE_PROJECT_ID`
`VITE_FIREBASE_STORAGE_BUCKET`
`VITE_FIREBASE_MESSAGING_SENDER_ID`
`VITE_FIREBASE_APP_ID`
`VITE_FIREBASE_VAPID_KEY`

The VAPID key is generated under Firebase Cloud Messaging -> Web Push certificates.

## 3. Backend service account
Firebase Console -> Project settings -> Service accounts -> Generate new private key.

Save the downloaded JSON somewhere outside the public frontend. For local development, the backend `.env` can contain:

`FIREBASE_SERVICE_ACCOUNT_FILE=./firebase-service-account.json`

Do not commit the service-account JSON to GitHub.

## 4. Background notifications
The file:

`frontend/public/firebase-messaging-sw.js`

contains placeholder Firebase Web App values. Replace them with the same web-app configuration used in `frontend/.env`.

This service worker is required for background FCM notifications.

## 5. Install dependencies

Frontend:

`npm install`

Backend:

`python -m pip install -r requirements.txt`

## 6. Sensor state
Each physical sensor now has a required `state` field in the Admin -> Sensors screen.

Enter the Indian state where the sensor is physically installed. This state is included in alerts.

## 7. Location mode
Members can choose:
- Live location: browser geolocation continuously updates the member's location.
- Manual coordinates: the member enters latitude and longitude and FloodGuard uses those coordinates without requesting live location.

The backend reverse-geocodes the selected coordinates to determine the member's state.

## 8. Alert behaviour
- Level 1 or higher creates an active flood area on the map.
- The active red area is calculated from the latest telemetry. When water falls below Level 1, the red area disappears.
- Every registered member receives an in-app India-wide sensor alert containing the affected state.
- When the water level crosses the Level 3 threshold upward (the second-highest / second-last threshold), members registered in that sensor's state receive the urgent vibration notification.
- The Level 3 crossing is detected from the previous telemetry reading, so remaining above Level 3 does not repeatedly trigger a new vibration on every reading.
