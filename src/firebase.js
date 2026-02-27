// Firebase initialization and exports
// Centralized config from src/config/firebaseConfig.js

import {initializeApp} from "firebase/app"
import {getAuth,connectAuthEmulator} from "firebase/auth"
import {bootstrapAnonymousAuth} from "./auth/bootstrapAnonymous"
import {getFirestore,connectFirestoreEmulator} from "firebase/firestore"
import {getFunctions,connectFunctionsEmulator} from "firebase/functions"
import {firebaseConfig} from "./config/firebaseConfig"

// Initialize Firebase
let app
try{
  app=initializeApp(firebaseConfig)
}catch(error){
  console.error("Firebase initialization error:",error)
  throw error
}

// Initialize App Check (safe, production-only)
import {initAppCheck} from "./firebase/appCheck"
initAppCheck(app)

// Services
export const auth=getAuth(app)
export const db=getFirestore(app)
export const functions=getFunctions(app)

// Emulator wiring (only when VITE_USE_EMULATORS === "true")
if (import.meta.env.VITE_USE_EMULATORS === "true") {
  connectFirestoreEmulator(db,"127.0.0.1",8081)
  connectAuthEmulator(auth,"http://127.0.0.1:9099",{disableWarnings:true})
  connectFunctionsEmulator(functions,"127.0.0.1",5001)
  console.debug("[Firebase] emulators",{firestore:"127.0.0.1:8081",functions:"127.0.0.1:5001",auth:"127.0.0.1:9099"})
  bootstrapAnonymousAuth(auth).catch(()=>{})
}

export default app
