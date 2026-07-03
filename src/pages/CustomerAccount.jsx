import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import {
  getMyOrders,
  updateCustomerProfile,
  uploadCustomerAvatar,
} from '../services/dataService'
import { formatPrice, formatDate, formatMonthYear } from '../utils/format'
import Spinner, { PageLoader } from '../components/ui/Spinner'
import StatusBadge from './admin/StatusBadge'
import {
  CheckIcon,
  AlertTriangleIcon,
  CameraIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  CartIcon,
  WalletIcon,
} from '../components/ui/icons'

const STEPS = ['pending', 'confirmed', 'delivered']

function initialsOf(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
}

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

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blush-50 text-plum-500">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-ink/40">{label}</p>
        <p className="truncate font-medium text-ink">{value || '—'}</p>
      </div>
    </div>
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)

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

  const stats = useMemo(() => {
    const total = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0)
    return { count: orders.length, total }
  }, [orders])

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

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast(t('account.photoError'), 'error')
      return
    }
    setUploadingAvatar(true)
    try {
      await uploadCustomerAvatar(user.uid, file, profile.avatarUrl)
      await refreshProfile()
      toast(t('account.photoUpdated'))
    } catch {
      toast(t('account.photoError'), 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const avatarUrl = profile.avatarUrl

  return (
    <>
      {/* ───────────── premium header ───────────── */}
      <section className="relative -mt-[68px] overflow-hidden bg-hero-gradient sm:-mt-20">
        <div className="pointer-events-none absolute -end-16 top-8 h-72 w-72 rounded-full bg-plum-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -start-16 h-72 w-72 rounded-full bg-blush-300/25 blur-3xl" />

        <div className="container-x relative pb-8 pt-24 lg:pt-28">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-start">
            {/* avatar + upload */}
            <div className="relative shrink-0">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blush-400 to-plum-500 shadow-soft ring-4 ring-white">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-4xl font-semibold text-white">
                    {initialsOf(profile.customerName) || '👤'}
                  </span>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/40">
                    <Spinner className="h-7 w-7 !border-white/50 !border-t-white" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                aria-label={avatarUrl ? t('account.changePhoto') : t('account.addPhoto')}
                title={avatarUrl ? t('account.changePhoto') : t('account.addPhoto')}
                className="absolute bottom-1 end-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-plum-600 shadow-card ring-1 ring-black/5 transition hover:bg-plum-50 disabled:opacity-50"
              >
                <CameraIcon className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* identity */}
            <div className="flex-1">
              <h1 className="font-display text-3xl font-semibold sm:text-4xl">
                {profile.customerName}
              </h1>
              <p className="mt-1 text-ink/60">{profile.email}</p>
              {profile.createdAt && (
                <p className="mt-1 text-xs text-plum-500">
                  {t('account.memberSince', { date: formatMonthYear(profile.createdAt, language) })}
                </p>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="btn-outline shrink-0 bg-white/70 backdrop-blur"
            >
              {t('account.logout')}
            </button>
          </div>

          {/* stat tiles */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:max-w-md">
            <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 shadow-sm backdrop-blur">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-plum-100 text-plum-600">
                <CartIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-semibold leading-none">{stats.count}</p>
                <p className="mt-1 text-xs text-ink/50">{t('account.statsOrders')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 shadow-sm backdrop-blur">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blush-100 text-blush-600">
                <WalletIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-semibold leading-none text-blush-600">
                  {formatPrice(stats.total, language)}
                </p>
                <p className="mt-1 text-xs text-ink/50">{t('account.statsTotal')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── body ───────────── */}
      <div className="container-x py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* profile details */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">{t('account.profileTitle')}</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-sm font-medium text-plum-600 hover:text-plum-700"
                  >
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
                <div className="space-y-4">
                  <InfoRow icon={MailIcon} label={t('checkout.email')} value={profile.email} />
                  <InfoRow icon={PhoneIcon} label={t('checkout.phone')} value={profile.phone} />
                  <InfoRow
                    icon={MapPinIcon}
                    label={t('checkout.address')}
                    value={`${profile.address}, ${profile.city} ${profile.postalCode || ''}`.trim()}
                  />
                </div>
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
                  return (
                    <div key={o.id} className="card overflow-hidden">
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-blush-50/40 px-5 py-4">
                        <div>
                          <p className="font-mono text-sm font-semibold text-plum-600">{o.orderRef}</p>
                          <p className="text-xs text-ink/40">
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
                      <div className="px-5 pt-4">
                        <OrderTimeline order={o} t={t} language={language} />
                      </div>
                      <ul className="space-y-1 border-t border-blush-50 px-5 py-4 text-sm">
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
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
