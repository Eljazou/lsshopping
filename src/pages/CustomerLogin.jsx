import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Defined at module scope — an inline component here would remount the
// <input> (and drop focus) on every keystroke. See Checkout.jsx for the
// same fix applied to the checkout form.
function Field({ name, label, type = 'text', required, half, value, error, onChange, ...rest }) {
  return (
    <div className={half ? 'sm:col-span-1' : 'sm:col-span-2'}>
      <label className="label" htmlFor={name}>
        {label} {required && <span className="text-blush-500">*</span>}
      </label>
      <input
        id={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`input ${error ? '!border-blush-400 !ring-blush-100' : ''}`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-blush-600">{error}</p>}
    </div>
  )
}

const EMPTY_SIGNUP = {
  customerName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  password: '',
}

export default function CustomerLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { signUp, signIn } = useCustomerAuth()
  const { toast } = useToast()

  const [mode, setMode] = useState('signup') // 'signup' | 'login'
  const [signupForm, setSignupForm] = useState(EMPTY_SIGNUP)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/compte'

  const setSignupField = (key) => (e) => {
    setSignupForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    const next = {}
    if (!signupForm.customerName.trim()) next.customerName = t('checkout.required')
    if (!signupForm.email.trim()) next.email = t('checkout.required')
    else if (!EMAIL_RE.test(signupForm.email)) next.email = t('checkout.invalidEmail')
    if (!signupForm.phone.trim()) next.phone = t('checkout.required')
    if (!signupForm.address.trim()) next.address = t('checkout.required')
    if (!signupForm.city.trim()) next.city = t('checkout.required')
    if (signupForm.password.length < 6) next.password = t('account.passwordTooShort')
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      await signUp(signupForm)
      toast(t('account.welcomeToast'))
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setErrors({ email: t('account.emailInUse') })
        setMode('login')
        setLoginForm((f) => ({ ...f, email: signupForm.email }))
      } else {
        toast(t('account.genericError'), 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await signIn(loginForm.email.trim(), loginForm.password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      toast(t('account.invalidLogin'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-x flex justify-center py-14 lg:py-20">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold sm:text-4xl">
            {mode === 'signup' ? t('account.createTitle') : t('account.loginTitle')}
          </h1>
          <span className="gold-divider mx-auto my-4" />
          <p className="text-sm text-ink/60">
            {mode === 'signup' ? t('account.createSubtitle') : t('account.loginSubtitle')}
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          {mode === 'signup' ? (
            <form onSubmit={handleSignup} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                name="customerName"
                label={t('checkout.fullName')}
                required
                autoComplete="name"
                value={signupForm.customerName}
                error={errors.customerName}
                onChange={setSignupField('customerName')}
              />
              <Field
                name="signup-email"
                label={t('checkout.email')}
                type="email"
                required
                autoComplete="email"
                value={signupForm.email}
                error={errors.email}
                onChange={setSignupField('email')}
              />
              <Field
                name="signup-phone"
                label={t('checkout.phone')}
                type="tel"
                required
                autoComplete="tel"
                placeholder="+212 6 00 00 00 00"
                value={signupForm.phone}
                error={errors.phone}
                onChange={setSignupField('phone')}
              />
              <Field
                name="signup-city"
                label={t('checkout.city')}
                required
                half
                autoComplete="address-level2"
                value={signupForm.city}
                error={errors.city}
                onChange={setSignupField('city')}
              />
              <Field
                name="signup-postal"
                label={t('checkout.postalCode')}
                half
                autoComplete="postal-code"
                value={signupForm.postalCode}
                error={errors.postalCode}
                onChange={setSignupField('postalCode')}
              />
              <Field
                name="signup-address"
                label={t('checkout.address')}
                required
                autoComplete="street-address"
                value={signupForm.address}
                error={errors.address}
                onChange={setSignupField('address')}
              />
              <Field
                name="signup-password"
                label={t('account.password')}
                type="password"
                required
                autoComplete="new-password"
                value={signupForm.password}
                error={errors.password}
                onChange={setSignupField('password')}
              />

              <button type="submit" disabled={submitting} className="btn-primary sm:col-span-2 mt-2 w-full">
                {submitting ? <Spinner className="h-5 w-5" /> : t('account.createCta')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field
                name="login-email"
                label={t('checkout.email')}
                type="email"
                required
                autoComplete="email"
                value={loginForm.email}
                error={errors.loginEmail}
                onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
              />
              <Field
                name="login-password"
                label={t('account.password')}
                type="password"
                required
                autoComplete="current-password"
                value={loginForm.password}
                error={errors.loginPassword}
                onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
              />
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? <Spinner className="h-5 w-5" /> : t('account.loginCta')}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-ink/60">
            {mode === 'signup' ? (
              <button onClick={() => setMode('login')} className="font-medium text-plum-600 hover:text-plum-700">
                {t('account.alreadyHaveAccount')}
              </button>
            ) : (
              <button onClick={() => setMode('signup')} className="font-medium text-plum-600 hover:text-plum-700">
                {t('account.needAccount')}
              </button>
            )}
          </div>
        </div>

        <Link to="/" className="mt-6 block text-center text-sm text-ink/50 hover:text-plum-600">
          ‹ {t('nav.home')}
        </Link>
      </div>
    </div>
  )
}
