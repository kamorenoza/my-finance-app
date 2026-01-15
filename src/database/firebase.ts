// src/database/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { GoogleAuthProvider } from 'firebase/auth/web-extension'

const firebaseConfig = {
  apiKey: 'AIzaSyBBmoNBdJMsAgAWc1HhX_qJjTelVEOvKUE',
  authDomain: 'my-finance-app-68e49.firebaseapp.com',
  projectId: 'my-finance-app-68e49',
  storageBucket: 'my-finance-app-68e49.firebasestorage.app',
  messagingSenderId: '1085002676590',
  appId: '1:1085002676590:web:248356fdddf4f74b42697f',
  measurementId: 'G-MMR7GJZ8WF'
}

export const firebaseApp = initializeApp(firebaseConfig)
const auth = getAuth(firebaseApp)
const provider = new GoogleAuthProvider()

export { auth, provider }
