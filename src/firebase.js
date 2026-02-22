// Firebase initialization and exports
// Centralized config from src/config/firebaseConfig.js

import {initializeApp} from "firebase/app"
import {getAuth,connectAuthEmulator} from "firebase/auth"
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

// Emulator wiring (DEV only, explicit toggle)
if(import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS==="true"){
  connectAuthEmulator(auth,"http://localhost:9099",{disableWarnings:true})
  connectFirestoreEmulator(db,"localhost",8080)
  connectFunctionsEmulator(functions,"localhost",5001)
}

export default app
