import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import { USE_MOCK, getAuthInstance } from '../config/firebase'
import {
  signUpCustomer,
  signInCustomer,
  signOutCustomer,
  getCustomerProfile,
} from '../services/dataService'

const CustomerAuthContext = createContext(null)

// Placing an order requires a customer account. In live mode this rides on
// the same Firebase Auth as the admin (onAuthStateChanged persists the
// session across reloads); in mock mode there's no real backend session, so
// state just lives in memory for the current tab and resets on refresh.
export function CustomerAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [initializing, setInitializing] = useState(!USE_MOCK)

  const loadProfile = useCallback(async (uid) => {
    const p = await getCustomerProfile(uid).catch(() => null)
    setProfile(p)
  }, [])

  useEffect(() => {
    if (USE_MOCK) return
    let unsubscribe = () => {}
    let cancelled = false

    getAuthInstance().then(async (auth) => {
      if (cancelled) return
      const { onAuthStateChanged } = await import('firebase/auth')
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (cancelled) return
        setUser(firebaseUser)
        if (firebaseUser) await loadProfile(firebaseUser.uid)
        else setProfile(null)
        setInitializing(false)
      })
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [loadProfile])

  const signUp = useCallback(
    async (data) => {
      const u = await signUpCustomer(data)
      if (USE_MOCK) {
        setUser(u)
        await loadProfile(u.uid)
      }
      return u
    },
    [loadProfile]
  )

  const signIn = useCallback(
    async (email, password) => {
      const u = await signInCustomer(email, password)
      if (USE_MOCK) {
        setUser(u)
        await loadProfile(u.uid)
      }
      return u
    },
    [loadProfile]
  )

  const logout = useCallback(async () => {
    await signOutCustomer()
    if (USE_MOCK) {
      setUser(null)
      setProfile(null)
    }
  }, [])

  const refreshProfile = useCallback(() => {
    if (user) return loadProfile(user.uid)
  }, [user, loadProfile])

  const value = useMemo(
    () => ({
      user,
      profile,
      isAuthed: !!user,
      initializing,
      signUp,
      signIn,
      logout,
      refreshProfile,
    }),
    [user, profile, initializing, signUp, signIn, logout, refreshProfile]
  )

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider')
  return ctx
}
