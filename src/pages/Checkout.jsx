import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { createOrder } from '../services/dataService'
import { sendOrderEmail } from '../services/emailService'
import { formatPrice, localized } from '../utils/format'
import ProductImage from '../components/ui/ProductImage'
import Spinner from '../components/ui/Spinner'
import { TruckIcon, ShieldIcon } from '../components/ui/icons'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+]?[\d\s-]{8,}$/

// Defined outside Checkout so its identity is stable across renders — an
// inline component here would remount the <input> (and drop focus) on
// every keystroke, since React treats each new function as a new type.
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

export default function Checkout() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { items, subtotal, clearCart } = useCart()

  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // If the cart is empty (and we're not mid-submit), go back to the cart.
  if (items.length === 0 && !submitting) {
    return <Navigate to="/cart" replace />
  }

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.customerName.trim()) next.customerName = t('checkout.required')
    if (!form.email.trim()) next.email = t('checkout.required')
    else if (!EMAIL_RE.test(form.email)) next.email = t('checkout.invalidEmail')
    if (!form.phone.trim()) next.phone = t('checkout.required')
    else if (!PHONE_RE.test(form.phone)) next.phone = t('checkout.invalidPhone')
    if (!form.address.trim()) next.address = t('checkout.required')
    if (!form.city.trim()) next.city = t('checkout.required')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast(t('checkout.required'), 'error')
      return
    }
    setSubmitting(true)
    try {
      const order = {
        ...form,
        items: items.map((i) => ({
          productId: i.id,
          name: localized(i.name, language),
          price: i.price,
          quantity: i.quantity,
        })),
        total: subtotal,
      }
      const saved = await createOrder(order)
      // Fire the owner notification (stubbed until EmailJS is configured).
      sendOrderEmail(saved).catch(() => {})
      clearCart()
      navigate('/confirmation', { state: { order: saved } })
    } catch (err) {
      console.error(err)
      toast('Something went wrong. Please try again.', 'error')
      setSubmitting(false)
    }
  }

  return (
    <div className="container-x py-10 lg:py-14">
      <h1 className="mb-8 text-3xl font-semibold sm:text-4xl">{t('checkout.title')}</h1>

      <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
        {/* form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3">
          {/* COD banner */}
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-gold-light bg-gold-light/20 p-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
              <TruckIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{t('checkout.cod')}</p>
              <p className="text-sm text-ink/60">{t('checkout.codBanner')}</p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-5 font-display text-xl font-semibold">
              {t('checkout.contactInfo')}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                name="customerName"
                label={t('checkout.fullName')}
                required
                autoComplete="name"
                value={form.customerName}
                error={errors.customerName}
                onChange={setField('customerName')}
              />
              <Field
                name="email"
                label={t('checkout.email')}
                type="email"
                required
                autoComplete="email"
                value={form.email}
                error={errors.email}
                onChange={setField('email')}
              />
              <Field
                name="phone"
                label={t('checkout.phone')}
                type="tel"
                required
                autoComplete="tel"
                placeholder="+212 6 00 00 00 00"
                value={form.phone}
                error={errors.phone}
                onChange={setField('phone')}
              />
              <Field
                name="city"
                label={t('checkout.city')}
                required
                half
                autoComplete="address-level2"
                value={form.city}
                error={errors.city}
                onChange={setField('city')}
              />
              <Field
                name="postalCode"
                label={t('checkout.postalCode')}
                half
                autoComplete="postal-code"
                value={form.postalCode}
                error={errors.postalCode}
                onChange={setField('postalCode')}
              />
              <Field
                name="address"
                label={t('checkout.address')}
                required
                autoComplete="street-address"
                value={form.address}
                error={errors.address}
                onChange={setField('address')}
              />

              <div className="sm:col-span-2">
                <label className="label" htmlFor="notes">
                  {t('checkout.notes')}
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={setField('notes')}
                  placeholder={t('checkout.notesPlaceholder')}
                  className="input resize-none"
                />
              </div>
            </div>

            {/* payment method */}
            <div className="mt-6">
              <span className="label">{t('checkout.paymentMethod')}</span>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-plum-300 bg-plum-50/50 p-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-plum-500">
                  <span className="h-3 w-3 rounded-full bg-plum-500" />
                </span>
                <div className="flex items-center gap-2">
                  <TruckIcon className="h-5 w-5 text-plum-600" />
                  <span className="font-medium">{t('checkout.cod')}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-6 w-full"
            >
              {submitting ? (
                <>
                  <Spinner className="h-5 w-5" />
                  {t('checkout.placing')}
                </>
              ) : (
                t('checkout.placeOrder')
              )}
            </button>
          </div>
        </form>

        {/* order summary */}
        <div className="lg:col-span-2">
          <div className="card sticky top-24 p-6">
            <h2 className="mb-4 font-display text-xl font-semibold">
              {t('checkout.yourOrder')}
            </h2>
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-blush-50">
                    <ProductImage
                      src={item.imageUrl}
                      alt={localized(item.name, language)}
                      label={localized(item.name, language)}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-plum-500 px-1 text-[11px] font-semibold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <span className="line-clamp-2 flex-1 text-sm">
                    {localized(item.name, language)}
                  </span>
                  <span className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity, language)}
                  </span>
                </div>
              ))}
            </div>

            <div className="my-4 h-px bg-blush-100" />

            <div className="flex items-center justify-between">
              <span className="font-semibold">{t('cart.total')}</span>
              <span className="text-2xl font-semibold text-blush-600">
                {formatPrice(subtotal, language)}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink/40">{t('cart.shippingNote')}</p>

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-blush-50/60 p-3 text-xs text-ink/60">
              <ShieldIcon className="h-4 w-4 text-plum-500" />
              {t('home.promise3Text')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
