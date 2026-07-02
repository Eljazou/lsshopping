import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import { USE_MOCK, getAuthInstance } from '../config/firebase'

const AdminAuthContext = createContext(null)

// The admin dashboard always uses real Firebase Authentication (email /
// password). There is no public sign-up — admin accounts are created
// manually in the Firebase console (Authentication > Users > Add user).
// Any authenticated user is treated as an admin (see firestore.rules /
// storage.rules), so only give this login to people you trust.
export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(!USE_MOCK)

  useEffect(() => {
    if (USE_MOCK) return
    let unsubscribe = () => {}
    let cancelled = false

    getAuthInstance().then(async (auth) => {
      if (cancelled) return
      const { onAuthStateChanged } = await import('firebase/auth')
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser)
        setInitializing(false)
      })
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const auth = await getAuthInstance()
    const { signInWithEmailAndPassword } = await import('firebase/auth')
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
  }, [])

  const logout = useCallback(async () => {
    const auth = await getAuthInstance()
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
