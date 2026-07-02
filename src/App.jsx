import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollToTop from './components/layout/ScrollToTop'

import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import NotFound from './pages/NotFound'

import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import RequireAdmin from './pages/admin/RequireAdmin'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Routes>
        {/* Admin has its own chrome (no storefront navbar/footer) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
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
