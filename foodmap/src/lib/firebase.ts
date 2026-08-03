import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY

export const firebaseEnabled = Boolean(apiKey)

let app: FirebaseApp | null = null
let _auth: Auth | null = null
let _db: Firestore | null = null
let _provider: GoogleAuthProvider | null = null

function getApp(): FirebaseApp | null {
  if (!firebaseEnabled) return null
  if (!app) {
    app = initializeApp({
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    })
  }
  return app
}

export function getFirebaseAuth(): Auth | null {
  if (!_auth) {
    const a = getApp()
    if (a) _auth = getAuth(a)
  }
  return _auth
}

export function getFirebaseDb(): Firestore | null {
  if (!_db) {
    const a = getApp()
    if (a) _db = getFirestore(a)
  }
  return _db
}

export function getGoogleProvider(): GoogleAuthProvider | null {
  if (!_provider) {
    const a = getApp()
    if (a) _provider = new GoogleAuthProvider()
  }
  return _provider
}

export async function loginWithGoogle(): Promise<User | null> {
  const auth = getFirebaseAuth()
  const provider = getGoogleProvider()
  if (!auth || !provider) return null
  const res = await signInWithPopup(auth, provider)
  return res.user
}

export async function logout(): Promise<void> {
  const auth = getFirebaseAuth()
  if (auth) await signOut(auth)
}

export function onAuthChange(cb: (user: User | null) => void) {
  const auth = getFirebaseAuth()
  if (!auth) return () => {}
  return onAuthStateChanged(auth, cb)
}
