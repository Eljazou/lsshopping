import { Routes, Route, NavLink, Navigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAdminAuth } from '../../context/AdminAuthContext'
import LanguageSwitcher from '../../components/layout/LanguageSwitcher'
import AdminOverview from './AdminOverview'
import AdminOrders from './AdminOrders'
import AdminProducts from './AdminProducts'
import AdminReviews from './AdminReviews'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { logout } = useAdminAuth()

  const tabClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-plum-500 text-white shadow-sm'
        : 'text-ink/70 hover:bg-blush-50'
    }`

  return (
    <div className="min-h-screen bg-blush-50/40">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-blush-100 bg-white/90 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/lslogo.png"
                alt="L&S Shopping"
                className="h-10 w-10 rounded-full object-cover ring-1 ring-gold/40"
              />
              <span className="hidden font-display text-xl font-semibold sm:inline">
                {t('brand.name')}
              </span>
            </Link>
            <span className="rounded-full bg-plum-100 px-3 py-1 text-xs font-medium text-plum-700">
              {t('admin.dashboard')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <button onClick={logout} className="btn-outline !px-4 !py-2 text-sm">
              {t('admin.logout')}
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="container-x flex gap-2 pb-3">
          <NavLink to="/admin/overview" className={tabClass} end>
            {t('admin.overviewTab')}
          </NavLink>
          <NavLink to="/admin/orders" className={tabClass}>
            {t('admin.orders')}
          </NavLink>
          <NavLink to="/admin/products" className={tabClass}>
            {t('admin.products')}
          </NavLink>
          <NavLink to="/admin/reviews" className={tabClass}>
            {t('reviews.adminTab')}
          </NavLink>
        </div>
      </header>

      <main className="container-x py-8">
        <Routes>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </main>
    </div>
  )
}
