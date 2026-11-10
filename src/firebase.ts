import { initializeApp } from "firebase/app"
import { getAnalytics, isSupported } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDu5i-zjBW7YLfhTFqRCglDxEzCsaF_iI0",
  authDomain: "institution-app-66082.firebaseapp.com",
  projectId: "institution-app-66082",
  storageBucket: "institution-app-66082.firebasestorage.app",
  messagingSenderId: "103159674512",
  appId: "1:103159674512:web:24474344f92aa111778a15",
  measurementId: "G-J79ETE7RFL",
}

export const firebaseApp = initializeApp(firebaseConfig)
export const analytics = null
export const isFirebaseConfigured = true