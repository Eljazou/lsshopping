import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { USE_MOCK } from '../../config/firebase'
import { PageLoader } from '../../components/ui/Spinner'
import FirebaseRequiredNotice from './FirebaseRequiredNotice'

// Guards admin routes: requires live Firebase + an authenticated Firebase
// Auth user. Redirects to /admin/login if signed out.
export default function RequireAdmin({ children }) {
  const { isAuthed, initializing } = useAdminAuth()
  const location = useLocation()

  if (USE_MOCK) return <FirebaseRequiredNotice />
  if (initializing) return <PageLoader />
  if (!isAuthed) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }
  return children
}
