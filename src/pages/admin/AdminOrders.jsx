import { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getOrders, updateOrderStatus, ORDER_STATUSES } from '../../services/dataService'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { formatPrice, formatDate } from '../../utils/format'
import { PageLoader } from '../../components/ui/Spinner'
import { SearchIcon } from '../../components/ui/icons'
import StatusBadge from './StatusBadge'

function StatCard({ label, value, accent }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-ink/50">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent || 'text-ink'}`}>{value}</p>
    </div>
  )
}

export default function AdminOrders() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { toast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getOrders().then((data) => {
      setOrders(data)
      setLoading(false)
    })
  }, [])

  const stats = useMemo(() => {
    const total = orders.length
    const pending = orders.filter((o) => o.status === 'pending').length
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0)
    return { total, pending, revenue }
  }, [orders])

  const filteredOrders = useMemo(() => {
    let list = orders
    if (statusFilter !== 'all') {
      list = list.filter((o) => o.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (o) =>
          o.customerName?.toLowerCase().includes(q) ||
          o.orderRef?.toLowerCase().includes(q)
      )
    }
    return list
  }, [orders, statusFilter, search])

  const changeStatus = async (order, status) => {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)))
    try {
      await updateOrderStatus(order.id, status)
      toast(t('admin.status.' + status))
    } catch {
      toast('Update failed', 'error')
    }
  }

  if (loading) return <PageLoader />

  return (
    <div>
      {/* stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t('admin.totalOrders')} value={stats.total} />
        <StatCard label={t('admin.pendingOrders')} value={stats.pending} accent="text-amber-600" />
        <StatCard
          label={t('admin.revenue')}
          value={formatPrice(stats.revenue, language)}
          accent="text-blush-600"
        />
      </div>

      {orders.length === 0 ? (
        <div className="card p-16 text-center text-ink/50">{t('admin.noOrders')}</div>
      ) : (
        <>
          {/* filter + search */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center rounded-full border border-plum-100 bg-white px-4 sm:w-72">
              <SearchIcon className="h-4 w-4 text-plum-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('admin.searchOrders')}
                className="w-full bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-plum-300"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input !w-auto cursor-pointer"
            >
              <option value="all">{t('admin.allStatuses')}</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`admin.status.${s}`)}
                </option>
              ))}
            </select>
          </div>

          {filteredOrders.length === 0 && (
            <div className="card p-16 text-center text-ink/50">{t('shop.noResults')}</div>
          )}

          {/* desktop table */}
          <div className="card hidden overflow-hidden lg:block">
            <table className="w-full text-sm">
              <thead className="bg-blush-50/60 text-start">
                <tr className="text-start text-xs uppercase tracking-wider text-ink/50">
                  <th className="p-4 text-start font-medium">{t('admin.orderRef')}</th>
                  <th className="p-4 text-start font-medium">{t('admin.customer')}</th>
                  <th className="p-4 text-start font-medium">{t('admin.contact')}</th>
                  <th className="p-4 text-start font-medium">{t('admin.itemsCol')}</th>
                  <th className="p-4 text-start font-medium">{t('admin.totalCol')}</th>
                  <th className="p-4 text-start font-medium">{t('admin.dateCol')}</th>
                  <th className="p-4 text-start font-medium">{t('admin.statusCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blush-50">
                {filteredOrders.map((o) => (
                  <Fragment key={o.id}>
                    <tr
                      className="cursor-pointer transition hover:bg-blush-50/40"
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    >
                      <td className="p-4 font-mono text-xs font-semibold text-plum-600">
                        {o.orderRef}
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{o.customerName}</p>
                        <p className="text-xs text-ink/50">
                          {o.city}
                          {o.postalCode ? `, ${o.postalCode}` : ''}
                        </p>
                      </td>
                      <td className="p-4 text-xs text-ink/60">
                        <p>{o.phone}</p>
                        <p>{o.email}</p>
                      </td>
                      <td className="p-4 text-ink/70">
                        {o.items.reduce((n, i) => n + i.quantity, 0)}
                      </td>
                      <td className="p-4 font-semibold text-blush-600">
                        {formatPrice(o.total, language)}
                      </td>
                      <td className="p-4 text-xs text-ink/50">
                        {formatDate(o.createdAt, language)}
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={o.status}
                          onChange={(e) => changeStatus(o, e.target.value)}
                          className="input !w-auto !py-1.5 !px-3 cursor-pointer text-xs"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {t(`admin.status.${s}`)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    {expanded === o.id && (
                      <tr className="bg-blush-50/30">
                        <td colSpan={7} className="p-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase text-ink/50">
                                {t('checkout.address')}
                              </p>
                              <p className="text-sm">
                                {o.address}, {o.city} {o.postalCode}
                              </p>
                              {o.notes && (
                                <p className="mt-2 text-sm text-ink/60">
                                  <span className="font-medium">{t('checkout.notes')}: </span>
                                  {o.notes}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase text-ink/50">
                                {t('admin.itemsCol')}
                              </p>
                              <ul className="space-y-1 text-sm">
                                {o.items.map((i, idx) => (
                                  <li key={idx} className="flex justify-between">
                                    <span>
                                      {i.name} × {i.quantity}
                                    </span>
                                    <span className="text-ink/60">
                                      {formatPrice(i.price * i.quantity, language)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* mobile cards */}
          <div className="space-y-4 lg:hidden">
            {filteredOrders.map((o) => (
              <div key={o.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-plum-600">
                    {o.orderRef}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-2 font-medium">{o.customerName}</p>
                <p className="text-xs text-ink/50">
                  {o.phone} · {o.city}
                </p>
                <ul className="mt-3 space-y-1 border-t border-blush-50 pt-3 text-sm">
                  {o.items.map((i, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span className="text-ink/70">
                        {i.name} × {i.quantity}
                      </span>
                      <span>{formatPrice(i.price * i.quantity, language)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-blush-50 pt-3">
                  <span className="font-semibold text-blush-600">
                    {formatPrice(o.total, language)}
                  </span>
                  <select
                    value={o.status}
                    onChange={(e) => changeStatus(o, e.target.value)}
                    className="input !w-auto !py-1.5 !px-3 text-xs"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t(`admin.status.${s}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
