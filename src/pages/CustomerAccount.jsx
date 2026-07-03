import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { updateCustomerProfile, uploadCustomerAvatar } from '../services/dataService'
import { formatMonthYear } from '../utils/format'
import Spinner, { PageLoader } from '../components/ui/Spinner'
import {
  CameraIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  CartIcon,
  ArrowRight,
} from '../components/ui/icons'

function initialsOf(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
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

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)

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
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blush-400 to-plum-500 shadow-soft ring-4 ring-white sm:h-28 sm:w-28">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-3xl font-semibold text-white sm:text-4xl">
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
                className="absolute bottom-0.5 end-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-plum-600 shadow-card ring-1 ring-black/5 transition hover:bg-plum-50 disabled:opacity-50 sm:bottom-1 sm:end-1 sm:h-9 sm:w-9"
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
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-2xl font-semibold sm:text-3xl lg:text-4xl">
                {profile.customerName}
              </h1>
              <p className="mt-1 truncate text-sm text-ink/60 sm:text-base">{profile.email}</p>
              {profile.createdAt && (
                <p className="mt-1 text-xs text-plum-500">
                  {t('account.memberSince', { date: formatMonthYear(profile.createdAt, language) })}
                </p>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="btn-outline w-full shrink-0 bg-white/70 backdrop-blur sm:w-auto"
            >
              {t('account.logout')}
            </button>
          </div>
        </div>
      </section>

      {/* ───────────── body ───────────── */}
      <div className="container-x max-w-2xl py-10 lg:py-14">
        <Link
          to="/suivi"
          className="card mb-6 flex items-center gap-4 p-5 transition hover:shadow-lg"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-plum-100 text-plum-600">
            <CartIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">{t('account.myOrders')}</p>
            <p className="truncate text-sm text-ink/50">{t('account.viewOrdersHint')}</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-ink/30" />
        </Link>

        <div className="card p-5 sm:p-6">
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
    </>
  )
}
