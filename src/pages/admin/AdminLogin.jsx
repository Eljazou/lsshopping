import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { USE_MOCK } from '../../config/firebase'
import Spinner from '../../components/ui/Spinner'
import FirebaseRequiredNotice from './FirebaseRequiredNotice'

export default function AdminLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, isAuthed } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (USE_MOCK) return <FirebaseRequiredNotice />

  if (isAuthed) {
    navigate('/admin', { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email.trim(), password)
      navigate('/admin', { replace: true })
    } catch (err) {
      console.error(err)
      setError(t('admin.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img
            src="/lslogo.png"
            alt="L&S Shopping"
            className="h-12 w-12 rounded-full object-cover ring-1 ring-gold/40"
          />
          <span className="font-display text-2xl font-semibold">{t('brand.name')}</span>
        </Link>

        <div className="card p-8">
          <h1 className="mb-1 text-center font-display text-2xl font-semibold">
            {t('admin.login')}
          </h1>
          <span className="gold-divider mx-auto mb-6 mt-2" />

          <form onSubmit={handleSubmit}>
            <label className="label" htmlFor="admin-email">
              {t('checkout.email')}
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              autoFocus
              autoComplete="email"
              className={`input mb-4 ${error ? '!border-blush-400 !ring-blush-100' : ''}`}
              placeholder="admin@ls-shopping.ma"
            />

            <label className="label" htmlFor="admin-password">
              {t('admin.password')}
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              autoComplete="current-password"
              className={`input ${error ? '!border-blush-400 !ring-blush-100' : ''}`}
              placeholder="••••••••"
            />
            {error && <p className="mt-2 text-sm text-blush-600">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
              {loading ? <Spinner className="h-5 w-5" /> : t('admin.signIn')}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-ink/40">
            {t('admin.noSignUpNotice')}
          </p>
        </div>

        <Link
          to="/"
          className="mt-6 block text-center text-sm text-ink/50 hover:text-plum-600"
        >
          ‹ {t('nav.home')}
        </Link>
      </div>
    </div>
  )
}
