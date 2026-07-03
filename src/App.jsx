import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollToTop from './components/layout/ScrollToTop'
import { PageLoader } from './components/ui/Spinner'

import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import CustomerLogin from './pages/CustomerLogin'
import CustomerAccount from './pages/CustomerAccount'
import CustomerOrders from './pages/CustomerOrders'
import RequireCustomer from './pages/RequireCustomer'
import NotFound from './pages/NotFound'

// Admin pulls in Firebase Auth/Storage and the recharts dashboard — none of
// which storefront visitors need. Lazy-loaded so that weight only downloads
// for someone actually navigating to /admin.
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const RequireAdmin = lazy(() => import('./pages/admin/RequireAdmin'))

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Routes>
        {/* Admin has its own chrome (no storefront navbar/footer) */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminLogin />
            </Suspense>
          }
        />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<PageLoader />}>
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            </Suspense>
          }
        />

        {/* Storefront */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/confirmation" element={<OrderConfirmation />} />
                  <Route path="/connexion" element={<CustomerLogin />} />
                  <Route
                    path="/compte"
                    element={
                      <RequireCustomer>
                        <CustomerAccount />
                      </RequireCustomer>
                    }
                  />
                  <Route
                    path="/suivi"
                    element={
                      <RequireCustomer>
                        <CustomerOrders />
                      </RequireCustomer>
                    }
                  />
                  <Route
                    path="/suivi/:ref"
                    element={
                      <RequireCustomer>
                        <CustomerOrders />
                      </RequireCustomer>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  )
}
