// Keep Firebase Admin initialization and service access behind one boundary.
// This facade uses the modular Admin SDK entry points required by v14 while
// preserving the small call shape used by the existing Functions modules.
const appSdk = require("firebase-admin/app");
const authSdk = require("firebase-admin/auth");
const appCheckSdk = require("firebase-admin/app-check");
const firestoreSdk = require("firebase-admin/firestore");

function firestore(app) {
  return firestoreSdk.getFirestore(app);
}

firestore.FieldValue = firestoreSdk.FieldValue;
firestore.Timestamp = firestoreSdk.Timestamp;

const admin = {
  initializeApp: appSdk.initializeApp,
  app: appSdk.getApp,
  auth: (app) => authSdk.getAuth(app),
  appCheck: (app) => appCheckSdk.getAppCheck(app),
  firestore,
  credential: {
    cert: appSdk.cert,
    applicationDefault: appSdk.applicationDefault,
  },
};

Object.defineProperty(admin, "apps", {
  enumerable: true,
  get: appSdk.getApps,
});

module.exports = admin;
