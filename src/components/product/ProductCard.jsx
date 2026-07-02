import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'
import { formatPrice, localized } from '../../utils/format'
import ProductImage from '../ui/ProductImage'
import { CartIcon } from '../ui/icons'

export default function ProductCard({ product }) {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { addItem } = useCart()
  const { toast } = useToast()

  const name = localized(product.name, language)
  const outOfStock = (product.stock ?? 0) <= 0
  const lowStock = !outOfStock && product.stock <= 5

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return
    addItem(product, 1)
    toast(t('product.added'))
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="group card flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-blush-50">
        <ProductImage
          src={product.imageUrl}
          alt={name}
          label={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {product.featured && (
          <span className="badge absolute start-3 top-3 bg-gold text-white shadow-sm">
            ★ {t('home.featuredTitle')}
          </span>
        )}
        {outOfStock && (
          <span className="badge absolute start-3 top-3 bg-ink/80 text-white">
            {t('product.outOfStock')}
          </span>
        )}
        {lowStock && (
          <span className="badge absolute start-3 top-3 bg-blush-500 text-white">
            {t('product.lowStock', { count: product.stock })}
          </span>
        )}

        {/* quick add */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          aria-label={t('product.addToCart')}
          className="absolute bottom-3 end-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-white text-plum-600 opacity-0 shadow-card transition-all duration-300 hover:bg-plum-500 hover:text-white group-hover:translate-y-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:bg-white/70 disabled:text-plum-200"
        >
          <CartIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-plum-400">
          {t(`categories.${product.category}`)}
        </span>
        <h3 className="line-clamp-2 flex-1 font-display text-lg leading-snug text-ink">
          {name}
        </h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-semibold text-blush-600">
            {formatPrice(product.price, language)}
          </span>
        </div>
      </div>
    </Link>
  )
}
