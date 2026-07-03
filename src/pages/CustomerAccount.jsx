import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { getMyOrders, updateCustomerProfile } from '../services/dataService'
import { formatPrice, formatDate } from '../utils/format'
import Spinner, { PageLoader } from '../components/ui/Spinner'
import { CheckIcon, AlertTriangleIcon } from '../components/ui/icons'

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

export default function CustomerAccount() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const { user, profile, logout, refreshProfile } = useCustomerAuth()
  const { toast } = useToast()

  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    let active = true
    getMyOrders(user.uid).then((data) => {
      if (!active) return
      setOrders(data)
      setLoadingOrders(false)
    })
    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    if (profile) setForm(profile)
  }, [profile])

  if (!profile || !form) return <PageLoader />

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateCustomerProfile(user.uid, {
        customerName: form.customerName,
        phone: form.phone,
        address: form.address,
        city: form.city,
        postalCode: form.postalCode || '',
      })
      await refreshProfile()
      setEditing(false)
      toast(t('account.profileSaved'))
    } catch {
      toast(t('account.genericError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="container-x py-10 lg:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{t('account.myAccount')}</h1>
          <p className="mt-1 text-sm text-ink/50">{profile.email}</p>
        </div>
        <button onClick={handleLogout} className="btn-outline">
          {t('account.logout')}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* profile card */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{t('account.profileTitle')}</h2>
              {!editing && (
                <button onClick={() => setEditing(true)} className="text-sm font-medium text-plum-600 hover:text-plum-700">
                  {t('admin.edit')}
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="label">{t('checkout.fullName')}</label>
                  <input
                    value={form.customerName}
                    onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">{t('checkout.phone')}</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="input"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">{t('checkout.city')}</label>
                    <input
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">{t('checkout.postalCode')}</label>
                    <input
                      value={form.postalCode || ''}
                      onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">{t('checkout.address')}</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className="input"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm(profile)
                      setEditing(false)
                    }}
                    className="btn-outline flex-1"
                  >
                    {t('admin.cancel')}
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? <Spinner className="h-5 w-5" /> : t('admin.save')}
                  </button>
                </div>
              </form>
            ) : (
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-ink/40">{t('checkout.fullName')}</dt>
                  <dd className="font-medium">{profile.customerName}</dd>
                </div>
                <div>
                  <dt className="text-ink/40">{t('checkout.phone')}</dt>
                  <dd className="font-medium">{profile.phone}</dd>
                </div>
                <div>
                  <dt className="text-ink/40">{t('checkout.address')}</dt>
                  <dd className="font-medium">
                    {profile.address}, {profile.city} {profile.postalCode}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        {/* orders */}
        <div className="lg:col-span-3">
          <h2 className="mb-4 font-display text-lg font-semibold">{t('account.myOrders')}</h2>
          {loadingOrders ? (
            <div className="flex justify-center py-10">
              <Spinner className="h-8 w-8" />
            </div>
          ) : orders.length === 0 ? (
            <div className="card p-10 text-center text-sm text-ink/50">{t('account.noOrders')}</div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blush-50 pb-4">
                    <div>
                      <p className="font-mono text-sm font-semibold text-plum-600">{o.orderRef}</p>
                      <p className="text-xs text-ink/40">{formatDate(o.createdAt, language)}</p>
                    </div>
                    <span className="text-lg font-semibold text-blush-600">
                      {formatPrice(o.total, language)}
                    </span>
                  </div>
                  <div className="pt-4">
                    <OrderTimeline order={o} t={t} language={language} />
                  </div>
                  <ul className="mt-2 space-y-1 border-t border-blush-50 pt-3 text-sm">
                    {(o.items || []).map((item, i) => (
                      <li key={i} className="flex justify-between text-ink/70">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>{formatPrice(item.price * item.quantity, language)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
