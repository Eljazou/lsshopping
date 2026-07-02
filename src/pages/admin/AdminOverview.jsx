import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getOrders, getProducts, ORDER_STATUSES } from '../../services/dataService'
import { useLanguage } from '../../context/LanguageContext'
import { formatPrice, formatDate, localized } from '../../utils/format'
import { PageLoader } from '../../components/ui/Spinner'
import StatusBadge from './StatusBadge'

const LOW_STOCK_THRESHOLD = 5

function StatCard({ label, value, accent }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-ink/50">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent || 'text-ink'}`}>{value}</p>
    </div>
  )
}

export default function AdminOverview() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([getOrders(), getProducts()]).then(([o, p]) => {
      if (!active) return
      setOrders(o)
      setProducts(p)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const byStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]))
    orders.forEach((o) => {
      if (byStatus[o.status] !== undefined) byStatus[o.status] += 1
    })
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0)
    const lowStock = products
      .filter((p) => (p.stock ?? 0) < LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.stock - b.stock)
    const recent = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)
    return {
      total: orders.length,
      byStatus,
      revenue,
      totalProducts: products.length,
      lowStock,
      recent,
    }
  }, [orders, products])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-8">
      {/* top stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('admin.totalOrders')} value={stats.total} />
        <StatCard
          label={t('admin.revenue')}
          value={formatPrice(stats.revenue, language)}
          accent="text-blush-600"
        />
        <StatCard label={t('admin.totalProducts')} value={stats.totalProducts} />
        <StatCard
          label={t('admin.lowStockAlerts')}
          value={stats.lowStock.length}
          accent={stats.lowStock.length > 0 ? 'text-amber-600' : undefined}
        />
      </div>

      {/* status breakdown */}
      <div className="card p-5">
        <h2 className="mb-4 font-display text-lg font-semibold">
          {t('admin.statusBreakdown')}
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {ORDER_STATUSES.map((s) => (
            <div key={s} className="rounded-2xl bg-blush-50/60 p-4 text-center">
              <StatusBadge status={s} />
              <p className="mt-2 text-2xl font-semibold">{stats.byStatus[s]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* low stock */}
        <div className="card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">
            {t('admin.lowStockAlerts')}
          </h2>
          {stats.lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/50">{t('admin.noLowStock')}</p>
          ) : (
            <ul className="divide-y divide-blush-50">
              {stats.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="line-clamp-1">{localized(p.name, language)}</span>
                  <span
                    className={`badge ${
                      p.stock <= 0
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {p.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/admin/products"
            className="mt-3 inline-block text-sm font-medium text-plum-600 hover:text-plum-700"
          >
            {t('admin.products')} ›
          </Link>
        </div>

        {/* recent orders */}
        <div className="card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">
            {t('admin.recentOrders')}
          </h2>
          {stats.recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/50">{t('admin.noOrders')}</p>
          ) : (
            <ul className="divide-y divide-blush-50">
              {stats.recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{o.customerName}</p>
                    <p className="text-xs text-ink/40">
                      {o.orderRef} · {formatDate(o.createdAt, language)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-semibold text-blush-600">
                      {formatPrice(o.total, language)}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/admin/orders"
            className="mt-3 inline-block text-sm font-medium text-plum-600 hover:text-plum-700"
          >
            {t('admin.viewAllOrders')} ›
          </Link>
        </div>
      </div>
    </div>
  )
}
