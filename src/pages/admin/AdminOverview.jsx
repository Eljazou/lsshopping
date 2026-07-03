import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { getOrders, getProducts, ORDER_STATUSES } from '../../services/dataService'
import { useLanguage } from '../../context/LanguageContext'
import { formatPrice, formatDate, localized } from '../../utils/format'
import { PageLoader } from '../../components/ui/Spinner'
import {
  CartIcon,
  WalletIcon,
  PackageIcon,
  AlertTriangleIcon,
} from '../../components/ui/icons'
import StatusBadge from './StatusBadge'

const LOW_STOCK_THRESHOLD = 5
const MONTHS_SHOWN = 6

// Fixed, reserved status colors — same hues as StatusBadge/STATUS_SELECT_STYLES
// everywhere else in the admin, so a color never means two different things.
const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  delivered: '#22c55e',
  cancelled: '#f43f5e',
}

function StatCard({ icon: Icon, iconClass, label, value, sub }) {
  return (
    <div className="card flex items-start gap-4 p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-ink/50">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold text-ink">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-ink/40">{sub}</p>}
      </div>
    </div>
  )
}

// Small rounded-card tooltip matching the app's own components instead of
// Recharts' default inline-styled box.
function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-ink px-3 py-2 text-xs text-white shadow-card">
      {label && <p className="mb-1 font-medium text-white/70">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="font-semibold" style={{ color: entry.color }}>
          {entry.name}: <span className="text-white">{formatter(entry.value)}</span>
        </p>
      ))}
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

    // Donut data: order count + percentage share per status (part-to-whole).
    const statusDonut = ORDER_STATUSES.map((s) => ({
      status: s,
      label: t(`admin.status.${s}`),
      value: byStatus[s],
      percent: orders.length ? Math.round((byStatus[s] / orders.length) * 100) : 0,
      color: STATUS_COLORS[s],
    })).filter((d) => d.value > 0)

    // Monthly units sold: sum item quantities from non-cancelled orders,
    // bucketed by month, for the last MONTHS_SHOWN months (fills in zeros
    // for months with no sales yet, like a real dashboard would).
    const now = new Date()
    const monthBuckets = Array.from({ length: MONTHS_SHOWN }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS_SHOWN - 1 - i), 1)
      return { key: `${d.getFullYear()}-${d.getMonth()}`, date: d, units: 0 }
    })
    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((o) => {
        const d = new Date(o.createdAt)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        const bucket = monthBuckets.find((b) => b.key === key)
        if (bucket) {
          bucket.units += (o.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0)
        }
      })
    const monthlyUnits = monthBuckets.map((b) => ({
      month: new Intl.DateTimeFormat(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-MA', {
        month: 'short',
      }).format(b.date),
      units: b.units,
    }))

    return {
      total: orders.length,
      byStatus,
      revenue,
      totalProducts: products.length,
      lowStock,
      recent,
      statusDonut,
      monthlyUnits,
    }
  }, [orders, products, language, t])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-8">
      {/* top stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CartIcon}
          iconClass="bg-plum-100 text-plum-600"
          label={t('admin.totalOrders')}
          value={stats.total}
        />
        <StatCard
          icon={WalletIcon}
          iconClass="bg-blush-100 text-blush-600"
          label={t('admin.revenue')}
          value={formatPrice(stats.revenue, language)}
        />
        <StatCard
          icon={PackageIcon}
          iconClass="bg-blue-100 text-blue-600"
          label={t('admin.totalProducts')}
          value={stats.totalProducts}
        />
        <StatCard
          icon={AlertTriangleIcon}
          iconClass={stats.lowStock.length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}
          label={t('admin.lowStockAlerts')}
          value={stats.lowStock.length}
        />
      </div>

      {/* charts row */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* order status donut */}
        <div className="card p-5">
          <h2 className="mb-1 font-display text-lg font-semibold">
            {t('admin.statusBreakdown')}
          </h2>
          <p className="mb-4 text-xs text-ink/40">{t('admin.statusBreakdownHint')}</p>
          {stats.total === 0 ? (
            <p className="py-16 text-center text-sm text-ink/50">{t('admin.noOrders')}</p>
          ) : (
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <div className="relative h-56 w-56 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.statusDonut}
                      dataKey="value"
                      nameKey="label"
                      innerRadius="62%"
                      outerRadius="95%"
                      paddingAngle={3}
                      cornerRadius={6}
                      stroke="none"
                    >
                      {stats.statusDonut.map((d) => (
                        <Cell key={d.status} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={
                        <ChartTooltip formatter={(v) => `${v} (${Math.round((v / stats.total) * 100)}%)`} />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold text-ink">{stats.total}</span>
                  <span className="text-xs text-ink/40">{t('admin.totalOrders')}</span>
                </div>
              </div>

              {/* legend with counts + percentages — never color alone */}
              <ul className="flex-1 space-y-2">
                {stats.statusDonut.map((d) => (
                  <li key={d.status} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      {d.label}
                    </span>
                    <span className="font-medium text-ink/70">
                      {d.value} · {d.percent}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* monthly units sold bar chart */}
        <div className="card p-5">
          <h2 className="mb-1 font-display text-lg font-semibold">
            {t('admin.monthlySales')}
          </h2>
          <p className="mb-4 text-xs text-ink/40">{t('admin.monthlySalesHint')}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyUnits} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#ffe9f1" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8a7a90', fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8a7a90', fontSize: 12 }}
                  width={28}
                />
                <Tooltip
                  cursor={{ fill: '#fff5f8' }}
                  content={<ChartTooltip formatter={(v) => `${v} ${t('admin.units')}`} />}
                />
                <Bar dataKey="units" name={t('admin.units')} fill="#8f57ec" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
