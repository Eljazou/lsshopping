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

// ─────────────────────────────────────────────────────────────
//  Secondary "admin" app instance.
//
//  Firebase Auth keeps its session per named app instance, so giving the
//  admin dashboard its own named app (instead of reusing the default one)
//  gives it a genuinely separate login — being signed in as admin never
//  makes the storefront think a customer is signed in, and vice versa.
//  Both apps still talk to the same Firestore/Storage backend and the same
//  security rules; only the Auth *session* is isolated.
// ─────────────────────────────────────────────────────────────
let adminAppPromise = null

function getAdminFirebaseApp() {
  if (!adminAppPromise) {
    if (!firebaseConfig.projectId) {
      throw new Error(
        'Firebase is not configured. Set VITE_FIREBASE_* in .env or keep VITE_USE_MOCK=true.'
      )
    }
    adminAppPromise = import('firebase/app').then(({ initializeApp }) =>
      initializeApp(firebaseConfig, 'admin')
    )
  }
  return adminAppPromise
}

let adminDbInstance = null
export async function getAdminDb() {
  if (!adminDbInstance) {
    const [app, { getFirestore }] = await Promise.all([
      getAdminFirebaseApp(),
      import('firebase/firestore'),
    ])
    adminDbInstance = getFirestore(app)
  }
  return adminDbInstance
}

let adminAuthInstance = null
export async function getAdminAuthInstance() {
  const [app, { getAuth }] = await Promise.all([
    getAdminFirebaseApp(),
    import('firebase/auth'),
  ])
  if (!adminAuthInstance) adminAuthInstance = getAuth(app)
  return adminAuthInstance
}

let adminStorageInstance = null
export async function getAdminStorageInstance() {
  const [app, { getStorage }] = await Promise.all([
    getAdminFirebaseApp(),
    import('firebase/storage'),
  ])
  if (!adminStorageInstance) adminStorageInstance = getStorage(app)
  return adminStorageInstance
}
