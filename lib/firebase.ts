import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyAvaZpHSYf8xM7ufyASaRwK-nwF0DBHwfo',
  authDomain: 'vj-oneflex.firebaseapp.com',
  databaseURL: 'https://vj-oneflex-default-rtdb.firebaseio.com',
  projectId: 'vj-oneflex',
  storageBucket: 'vj-oneflex.firebasestorage.app',
  messagingSenderId: '373577647429',
  appId: '1:373577647429:web:f3ad8ef61ae570ccdf6a2c',
  measurementId: 'G-PTQ7VBPSR9',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

// Initialize Firebase Auth
export const auth = getAuth(app)

// Initialize Cloud Firestore
export const db = getFirestore(app)

// Initialize Cloud Storage
export const storage = getStorage(app)

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('profile')
googleProvider.addScope('email')
