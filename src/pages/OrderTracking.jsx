import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getOrderByRef } from '../services/dataService'
import { useLanguage } from '../context/LanguageContext'
import { formatPrice, formatDate } from '../utils/format'
import Spinner from '../components/ui/Spinner'
import { SearchIcon, CheckIcon, AlertTriangleIcon, TruckIcon } from '../components/ui/icons'

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
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  done ? 'bg-plum-500 text-white' : 'bg-blush-100 text-plum-300'
                }`}
              >
                {done ? <CheckIcon className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
              </span>
              {!isLast && (
                <span
                  className={`w-px flex-1 ${i < currentIndex ? 'bg-plum-400' : 'bg-blush-100'}`}
                  style={{ minHeight: '2.5rem' }}
                />
              )}
            </div>
            <div className={isLast ? 'pb-1' : 'pb-8'}>
              <p className={`font-medium ${done ? 'text-ink' : 'text-ink/40'}`}>
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

export default function OrderTracking() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { ref } = useParams()
  const navigate = useNavigate()

  const [input, setInput] = useState(ref || '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [searched, setSearched] = useState(false)

  const runSearch = async (value) => {
    const cleaned = value.trim().toUpperCase()
    if (!cleaned) return
    setLoading(true)
    setNotFound(false)
    setSearched(true)
    const found = await getOrderByRef(cleaned)
    setOrder(found)
    setNotFound(!found)
    setLoading(false)
  }

  useEffect(() => {
    if (ref) runSearch(ref)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])

  const handleSubmit = (e) => {
    e.preventDefault()
    const cleaned = input.trim().toUpperCase()
    if (!cleaned) return
    navigate(`/suivi/${cleaned}`)
  }

  return (
    <div className="container-x py-10 lg:py-14">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">{t('tracking.title')}</h1>
        <span className="gold-divider mx-auto my-4" />
        <p className="text-sm text-ink/60">{t('tracking.subtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center rounded-full border border-plum-100 bg-white px-4 shadow-card focus-within:border-plum-300">
            <SearchIcon className="h-5 w-5 shrink-0 text-plum-400" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('tracking.placeholder')}
              className="w-full bg-transparent px-3 py-3 text-sm uppercase outline-none placeholder:normal-case placeholder:text-plum-300"
            />
          </div>
          <button type="submit" className="btn-primary shrink-0">
            {t('tracking.searchCta')}
          </button>
        </form>
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        {loading && (
          <div className="flex justify-center py-16">
            <Spinner className="h-10 w-10" />
          </div>
        )}

        {!loading && searched && notFound && (
          <div className="card flex flex-col items-center gap-3 p-8 text-center">
            <AlertTriangleIcon className="h-8 w-8 text-amber-500" />
            <p className="font-medium">{t('tracking.notFoundTitle')}</p>
            <p className="text-sm text-ink/50">{t('tracking.notFoundText')}</p>
          </div>
        )}

        {!loading && order && (
          <div className="space-y-6 animate-fade-in-up">
            {/* header */}
            <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-ink/40">
                  {t('confirmation.orderRef')}
                </p>
                <p className="font-display text-2xl font-semibold text-plum-700">{order.orderRef}</p>
              </div>
              <div className="text-end">
                <p className="text-xs uppercase tracking-widest text-ink/40">{t('checkout.yourOrder')}</p>
                <p className="text-xl font-semibold text-blush-600">
                  {formatPrice(order.total, language)}
                </p>
              </div>
            </div>

            {/* timeline */}
            <div className="card p-6">
              <h2 className="mb-5 font-display text-lg font-semibold">{t('tracking.statusTitle')}</h2>
              <OrderTimeline order={order} t={t} language={language} />
            </div>

            {/* items + delivery */}
            <div className="card p-6">
              <h2 className="mb-4 font-display text-lg font-semibold">{t('confirmation.summary')}</h2>
              <div className="divide-y divide-blush-100">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="flex-1">
                      {item.name} <span className="text-ink/40">× {item.quantity}</span>
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.price * item.quantity, language)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 rounded-2xl bg-blush-50/60 p-4 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-ink/50">{t('checkout.fullName')}: </span>
                  {order.customerName}
                </p>
                <p>
                  <span className="text-ink/50">{t('checkout.phone')}: </span>
                  {order.phone}
                </p>
                <p className="sm:col-span-2">
                  <span className="text-ink/50">{t('checkout.address')}: </span>
                  {order.address}, {order.city} {order.postalCode}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-blush-50/60 p-3 text-xs text-ink/60">
                <TruckIcon className="h-4 w-4 shrink-0 text-plum-500" />
                {t('checkout.cod')} — {t('checkout.codBanner')}
              </div>
            </div>

            <div className="flex justify-center">
              <Link to="/shop" className="btn-outline">
                {t('confirmation.continueShopping')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
