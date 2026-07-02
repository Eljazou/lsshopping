// Firebase initialization.
//
// The storefront talks to Firestore through src/services/dataService.js, which
// checks VITE_USE_MOCK. When mock mode is on (the default), Firebase is never
// initialized and you don't need any real credentials.
//
// The admin dashboard (src/pages/admin) always requires live Firebase — it
// uses Firebase Auth (email/password) and Firebase Storage, neither of which
// have a meaningful mock equivalent. See RequireAdmin / FirebaseRequiredNotice.
export const USE_MOCK =
  String(import.meta.env.VITE_USE_MOCK ?? 'true').toLowerCase() !== 'false'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// All Firebase products (Firestore, Auth, Storage) share a single app
// instance. Everything is dynamically imported so Firebase stays out of the
// bundle entirely in mock mode — keeping the initial download small.
let appPromise = null

function getFirebaseApp() {
  if (!appPromise) {
    if (!firebaseConfig.projectId) {
      throw new Error(
        'Firebase is not configured. Set VITE_FIREBASE_* in .env or keep VITE_USE_MOCK=true.'
      )
    }
    appPromise = import('firebase/app').then(({ initializeApp }) =>
      initializeApp(firebaseConfig)
    )
  }
  return appPromise
}

let dbInstance = null
export async function getDb() {
  if (USE_MOCK) return null
  if (!dbInstance) {
    const [app, { getFirestore }] = await Promise.all([
      getFirebaseApp(),
      import('firebase/firestore'),
    ])
    dbInstance = getFirestore(app)
  }
  return dbInstance
}

let authInstance = null
export async function getAuthInstance() {
  const [app, { getAuth }] = await Promise.all([
    getFirebaseApp(),
    import('firebase/auth'),
  ])
  if (!authInstance) authInstance = getAuth(app)
  return authInstance
}

let storageInstance = null
export async function getStorageInstance() {
  const [app, { getStorage }] = await Promise.all([
    getFirebaseApp(),
    import('firebase/storage'),
  ])
  if (!storageInstance) storageInstance = getStorage(app)
  return storageInstance
}
