import { Navigate, useLocation } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { PageLoader } from '../components/ui/Spinner'

// Guards customer-only routes (account page, order history): requires a
// signed-in customer, redirects to /connexion otherwise. Home/Shop/Cart stay
// fully public — only account-specific pages need this.
export default function RequireCustomer({ children }) {
  const { isAuthed, initializing } = useCustomerAuth()
  const location = useLocation()

  if (initializing) return <PageLoader />
  if (!isAuthed) {
    return <Navigate to="/connexion" replace state={{ from: location }} />
  }
  return children
}
