import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { formatPrice, localized } from '../utils/format'
import ProductImage from '../components/ui/ProductImage'
import QuantitySelector from '../components/ui/QuantitySelector'
import { TrashIcon, CartIcon, ArrowRight } from '../components/ui/icons'

export default function Cart() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { items, subtotal, count, setQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="container-x flex flex-col items-center gap-5 py-24 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blush-50 text-plum-300">
          <CartIcon className="h-11 w-11" />
        </div>
        <h1 className="text-2xl font-semibold">{t('cart.empty')}</h1>
        <Link to="/shop" className="btn-primary">
          {t('cart.emptyCta')}
        </Link>
      </div>
    )
  }

  return (
    <div className="container-x py-10 lg:py-14">
      <h1 className="mb-8 text-3xl font-semibold sm:text-4xl">
        {t('cart.title')}{' '}
        <span className="text-lg font-normal text-ink/40">
          ({count} {count > 1 ? t('cart.items') : t('cart.item')})
        </span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* items */}
        <div className="lg:col-span-2">
          <div className="card divide-y divide-blush-100 overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 sm:p-5">
                <Link
                  to={`/product/${item.id}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-blush-50 sm:h-28 sm:w-28"
                >
                  <ProductImage
                    src={item.imageUrl}
                    alt={localized(item.name, language)}
                    label={localized(item.name, language)}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/product/${item.id}`}
                      className="font-display text-lg leading-snug hover:text-plum-600"
                    >
                      {localized(item.name, language)}
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1 text-sm text-plum-300 transition hover:text-blush-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">{t('cart.remove')}</span>
                    </button>
                  </div>

                  <span className="mt-1 text-sm text-ink/50">
                    {formatPrice(item.price, language)}
                  </span>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QuantitySelector
                      value={item.quantity}
                      max={item.stock ?? 99}
                      onChange={(q) => setQuantity(item.id, q)}
                    />
                    <span className="text-lg font-semibold text-blush-600">
                      {formatPrice(item.price * item.quantity, language)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/shop"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-plum-600 hover:text-plum-700"
          >
            ‹ {t('cart.continue')}
          </Link>
        </div>

        {/* summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <h2 className="mb-4 font-display text-xl font-semibold">
              {t('cart.summary')}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink/60">{t('cart.subtotal')}</span>
                <span className="font-medium">{formatPrice(subtotal, language)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink/60">{t('cart.shipping')}</span>
                <span className="text-ink/50">{t('cart.shippingNote')}</span>
              </div>
              <div className="my-3 h-px bg-blush-100" />
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold">{t('cart.total')}</span>
                <span className="text-2xl font-semibold text-blush-600">
                  {formatPrice(subtotal, language)}
                </span>
              </div>
            </div>

            <Link to="/checkout" className="btn-primary group mt-6 w-full">
              {t('cart.checkout')}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180" />
            </Link>

            <p className="mt-3 text-center text-xs text-ink/40">
              {t('checkout.cod')} · {t('home.promise1Text')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
