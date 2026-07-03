import { Link, useLocation, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../context/LanguageContext'
import { formatPrice } from '../utils/format'
import { CheckIcon } from '../components/ui/icons'

export default function OrderConfirmation() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const location = useLocation()
  const order = location.state?.order

  // Direct visits with no order state → send home.
  if (!order) return <Navigate to="/" replace />

  const steps = ['step1', 'step2', 'step3']

  return (
    <div className="container-x py-14 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 animate-fade-in items-center justify-center rounded-full bg-gradient-to-br from-blush-400 to-plum-500 text-white shadow-soft">
          <CheckIcon className="h-10 w-10" />
        </div>

        <h1 className="text-3xl font-semibold sm:text-4xl">{t('confirmation.title')}</h1>
        <p className="mx-auto mt-3 max-w-md text-ink/60">{t('confirmation.subtitle')}</p>

        {/* order ref */}
        <div className="mx-auto mt-8 inline-flex flex-col items-center rounded-2xl border border-gold-light bg-gold-light/20 px-8 py-4">
          <span className="text-xs uppercase tracking-widest text-ink/50">
            {t('confirmation.orderRef')}
          </span>
          <span className="font-display text-2xl font-semibold text-gold-dark">
            {order.orderRef}
          </span>
        </div>
      </div>

      {/* summary */}
      <div className="mx-auto mt-10 max-w-2xl">
        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">
            {t('confirmation.summary')}
          </h2>
          <div className="divide-y divide-blush-100">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <span className="flex-1">
                  {item.name}{' '}
                  <span className="text-ink/40">× {item.quantity}</span>
                </span>
                <span className="font-medium">
                  {formatPrice(item.price * item.quantity, language)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-blush-100 pt-4">
            <span className="font-semibold">{t('cart.total')}</span>
            <span className="text-xl font-semibold text-blush-600">
              {formatPrice(order.total, language)}
            </span>
          </div>

          {/* delivery details */}
          <div className="mt-6 grid grid-cols-1 gap-2 rounded-2xl bg-blush-50/60 p-4 text-sm sm:grid-cols-2">
            <p><span className="text-ink/50">{t('checkout.fullName')}: </span>{order.customerName}</p>
            <p><span className="text-ink/50">{t('checkout.phone')}: </span>{order.phone}</p>
            <p className="sm:col-span-2">
              <span className="text-ink/50">{t('checkout.address')}: </span>
              {order.address}, {order.city} {order.postalCode}
            </p>
          </div>
        </div>

        {/* next steps */}
        <div className="mt-8">
          <h3 className="mb-4 text-center font-display text-lg font-semibold">
            {t('confirmation.whatNext')}
          </h3>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={s} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-plum-500 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-sm text-ink/70">
                  {t(`confirmation.${s}`)}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/shop" className="btn-primary">
            {t('confirmation.continueShopping')}
          </Link>
          <Link to={`/suivi/${order.orderRef}`} className="btn-outline">
            {t('confirmation.trackOrder')}
          </Link>
        </div>
      </div>
    </div>
  )
}
