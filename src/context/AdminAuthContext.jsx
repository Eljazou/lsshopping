import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import { USE_MOCK, getAdminAuthInstance, getAdminDb } from '../config/firebase'

const AdminAuthContext = createContext(null)

// The admin dashboard runs on its own secondary Firebase app instance (see
// getAdminAuthInstance/getAdminDb in config/firebase.js), completely
// separate from the customer-facing one used by CustomerAuthContext. That's
// what keeps the two logins from ever leaking into each other — an admin
// signed in here is never mistaken for a signed-in customer on the
// storefront, and a customer account is never enough to reach the admin UI.
//
// Admin accounts are created manually (Firebase console + a matching
// /admins/{uid} Firestore doc, written only via the Admin SDK). Being
// signed in to the admin app is still not enough on its own — admin status
// is only granted to UIDs listed in /admins, checked both here and,
// authoritatively, in firestore.rules.
async function checkIsAdmin(uid) {
  const db = await getAdminDb()
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'admins', uid))
  return snap.exists()
}

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(!USE_MOCK)

  useEffect(() => {
    if (USE_MOCK) return
    let unsubscribe = () => {}
    let cancelled = false

    getAdminAuthInstance().then(async (auth) => {
      if (cancelled) return
      const { onAuthStateChanged } = await import('firebase/auth')
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (cancelled) return
        if (!firebaseUser) {
          setUser(null)
          setInitializing(false)
          return
        }
        const isAdmin = await checkIsAdmin(firebaseUser.uid).catch(() => false)
        if (cancelled) return
        setUser(isAdmin ? firebaseUser : null)
        setInitializing(false)
      })
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const auth = await getAdminAuthInstance()
    const { signInWithEmailAndPassword, signOut } = await import('firebase/auth')
    const credential = await signInWithEmailAndPassword(auth, email, password)
    const isAdmin = await checkIsAdmin(credential.user.uid).catch(() => false)
    if (!isAdmin) {
      // Valid account, but not an admin — don't leave a dangling session.
      await signOut(auth)
      throw new Error('NOT_ADMIN')
    }
    return credential.user
  }, [])

  const logout = useCallback(async () => {
    const auth = await getAdminAuthInstance()
    const { signOut } = await import('firebase/auth')
    await signOut(auth)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthed: !!user,
      initializing,
      login,
      logout,
    }),
    [user, initializing, login, logout]
  )

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
