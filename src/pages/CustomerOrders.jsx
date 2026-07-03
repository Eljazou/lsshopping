import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { useLanguage } from '../context/LanguageContext'
import { getMyOrders } from '../services/dataService'
import { formatPrice, formatDate } from '../utils/format'
import { PageLoader } from '../components/ui/Spinner'
import StatusBadge from './admin/StatusBadge'
import { CheckIcon, AlertTriangleIcon, CartIcon, WalletIcon } from '../components/ui/icons'

const STEPS = ['pending', 'confirmed', 'delivered']

function OrderTimeline({ order, t, language }) {
  if (order.status === 'cancelled') {
    const cancelEntry = [...(order.statusHistory || [])].reverse().find((h) => h.status === 'cancelled')
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangleIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-rose-700">{t('tracking.cancelledTitle')}</p>
          {cancelEntry && (
            <p className="text-sm text-rose-600/70">{formatDate(cancelEntry.changedAt, language)}</p>
          )}
        </div>
      </div>
    )
  }

  const currentIndex = STEPS.indexOf(order.status)

  return (
    <ol>
      {STEPS.map((s, i) => {
        const entry = (order.statusHistory || []).find((h) => h.status === s)
        const done = i <= currentIndex
        const isLast = i === STEPS.length - 1
        return (
          <li key={s} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                  done ? 'bg-plum-500 text-white' : 'bg-blush-100 text-plum-300'
                }`}
              >
                {done ? <CheckIcon className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
              </span>
              {!isLast && (
                <span
                  className={`w-px flex-1 ${i < currentIndex ? 'bg-plum-400' : 'bg-blush-100'}`}
                  style={{ minHeight: '2rem' }}
                />
              )}
            </div>
            <div className={isLast ? 'pb-1' : 'pb-6'}>
              <p className={`text-sm font-medium ${done ? 'text-ink' : 'text-ink/40'}`}>
                {t(`admin.status.${s}`)}
              </p>
              {entry ? (
                <p className="text-xs text-ink/40">{formatDate(entry.changedAt, language)}</p>
              ) : (
                <p className="text-xs text-ink/30">{t('tracking.pendingStep')}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default function CustomerOrders() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { user } = useCustomerAuth()
  const { ref: highlightRef } = useParams()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const highlightedNode = useRef(null)

  useEffect(() => {
    if (!user) return
    let active = true
    getMyOrders(user.uid).then((data) => {
      if (!active) return
      setOrders(data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    if (highlightRef && highlightedNode.current) {
      highlightedNode.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [highlightRef, orders])

  const stats = useMemo(() => {
    const total = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0)
    return { count: orders.length, total }
  }, [orders])

  return (
    <div className="container-x py-10 lg:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">{t('account.myOrders')}</h1>
          <Link to="/compte" className="mt-1 inline-block text-sm font-medium text-plum-600 hover:text-plum-700">
            {t('account.backToProfile')}
          </Link>
        </div>
        <div className="flex gap-3">
          <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-plum-100 text-plum-600">
              <CartIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold leading-none">{stats.count}</p>
              <p className="mt-1 truncate text-xs text-ink/50">{t('account.statsOrders')}</p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blush-100 text-blush-600">
              <WalletIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold leading-none text-blush-600">
                {formatPrice(stats.total, language)}
              </p>
              <p className="mt-1 truncate text-xs text-ink/50">{t('account.statsTotal')}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : orders.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 p-12 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush-50 text-plum-300">
            <CartIcon className="h-8 w-8" />
          </span>
          <p className="text-sm text-ink/50">{t('account.noOrders')}</p>
          <Link to="/shop" className="btn-primary">
            {t('account.startShopping')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const itemCount = (o.items || []).reduce((n, i) => n + i.quantity, 0)
            const isHighlighted = highlightRef && o.orderRef === highlightRef
            return (
              <div
                key={o.id}
                ref={isHighlighted ? highlightedNode : null}
                className={`card overflow-hidden ${
                  isHighlighted ? 'ring-2 ring-plum-400' : ''
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 bg-blush-50/40 px-4 py-4 sm:px-5">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-semibold text-plum-600">{o.orderRef}</p>
                    <p className="truncate text-xs text-ink/40">
                      {formatDate(o.createdAt, language)} ·{' '}
                      {t('account.orderCount', { count: itemCount })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={o.status} />
                    <span className="text-lg font-semibold text-blush-600">
                      {formatPrice(o.total, language)}
                    </span>
                  </div>
                </div>
                <div className="px-4 pt-4 sm:px-5">
                  <OrderTimeline order={o} t={t} language={language} />
                </div>
                <ul className="space-y-1 border-t border-blush-50 px-4 py-4 text-sm sm:px-5">
                  {(o.items || []).map((item, i) => (
                    <li key={i} className="flex justify-between gap-2 text-ink/70">
                      <span className="min-w-0 truncate">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="shrink-0">{formatPrice(item.price * item.quantity, language)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
