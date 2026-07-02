import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../context/CartContext'
import { useLanguage } from '../../context/LanguageContext'
import { formatPrice, localized } from '../../utils/format'
import ProductImage from '../ui/ProductImage'
import QuantitySelector from '../ui/QuantitySelector'
import { CloseIcon, TrashIcon, CartIcon } from '../ui/icons'

export default function CartDrawer({ open, onClose }) {
  const { t } = useTranslation()
  const { language, isRTL } = useLanguage()
  const { items, subtotal, count, setQuantity, removeItem } = useCart()

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => (document.body.style.overflow = '')
    }
  }, [open])

  const side = isRTL ? 'left-0' : 'right-0'
  const hidden = isRTL ? '-translate-x-full' : 'translate-x-full'

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed ${side} top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : hidden
        }`}
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-blush-100 px-5 py-4">
          <h2 className="font-display text-xl font-semibold">
            {t('cart.title')} {count > 0 && <span className="text-plum-400">({count})</span>}
          </h2>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-blush-50"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blush-50 text-plum-300">
              <CartIcon className="h-9 w-9" />
            </div>
            <p className="text-ink/60">{t('cart.empty')}</p>
            <Link to="/shop" onClick={onClose} className="btn-primary">
              {t('cart.emptyCta')}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <Link
                    to={`/product/${item.id}`}
                    onClick={onClose}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-blush-50"
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
                        onClick={onClose}
                        className="line-clamp-2 text-sm font-medium hover:text-plum-600"
                      >
                        {localized(item.name, language)}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={t('cart.remove')}
                        className="text-plum-300 transition hover:text-blush-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="mb-2 text-sm font-semibold text-blush-600">
                      {formatPrice(item.price, language)}
                    </span>
                    <QuantitySelector
                      size="sm"
                      value={item.quantity}
                      max={item.stock ?? 99}
                      onChange={(q) => setQuantity(item.id, q)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <footer className="border-t border-blush-100 px-5 py-4">
              <div className="mb-1 flex items-center justify-between text-sm text-ink/60">
                <span>{t('cart.shipping')}</span>
                <span>{t('cart.shippingNote')}</span>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-medium">{t('cart.subtotal')}</span>
                <span className="text-xl font-semibold text-blush-600">
                  {formatPrice(subtotal, language)}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Link to="/checkout" onClick={onClose} className="btn-primary w-full">
                  {t('cart.checkout')}
                </Link>
                <Link to="/cart" onClick={onClose} className="btn-outline w-full">
                  {t('cart.title')}
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </>
  )
}
