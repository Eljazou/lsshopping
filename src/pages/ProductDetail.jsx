import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getProduct, getProducts } from '../services/dataService'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'
import { formatPrice, localized } from '../utils/format'
import ProductImage from '../components/ui/ProductImage'
import QuantitySelector from '../components/ui/QuantitySelector'
import ProductGrid from '../components/product/ProductGrid'
import SectionHeading from '../components/ui/SectionHeading'
import { PageLoader } from '../components/ui/Spinner'
import { CartIcon, ArrowRight, TruckIcon, ShieldIcon, CheckIcon } from '../components/ui/icons'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { addItem } = useCart()
  const { toast } = useToast()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    let active = true
    setLoading(true)
    setQty(1)
    Promise.all([getProduct(id), getProducts()]).then(([p, all]) => {
      if (!active) return
      setProduct(p)
      if (p) {
        setRelated(
          all
            .filter((x) => x.category === p.category && x.id !== p.id)
            .slice(0, 4)
        )
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [id])

  if (loading) return <PageLoader />

  if (!product) {
    return (
      <div className="container-x flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-lg text-ink/60">404 — {t('shop.noResults')}</p>
        <Link to="/shop" className="btn-primary">
          {t('product.backToShop')}
        </Link>
      </div>
    )
  }

  const name = localized(product.name, language)
  const description = localized(product.description, language)
  const outOfStock = (product.stock ?? 0) <= 0

  const handleAdd = () => {
    if (outOfStock) return
    addItem(product, qty)
    toast(t('product.added'))
  }

  const buyNow = () => {
    if (outOfStock) return
    addItem(product, qty)
    navigate('/checkout')
  }

  return (
    <div className="container-x py-8 lg:py-12">
      {/* breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-ink/50">
        <Link to="/shop" className="hover:text-plum-600">
          {t('nav.shop')}
        </Link>
        <span className="rtl:rotate-180">›</span>
        <Link to={`/shop?category=${product.category}`} className="hover:text-plum-600">
          {t(`categories.${product.category}`)}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* image */}
        <div className="animate-fade-in">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-blush-50 shadow-card">
            <ProductImage
              src={product.imageUrl}
              alt={name}
              label={name}
              className="h-full w-full object-cover"
            />
            {product.featured && (
              <span className="badge absolute start-4 top-4 bg-gold text-white shadow-sm">
                ★ {t('home.featuredTitle')}
              </span>
            )}
          </div>
        </div>

        {/* info */}
        <div className="animate-fade-in-up flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wider text-plum-400">
            {t(`categories.${product.category}`)}
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            {name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-semibold text-blush-600">
              {formatPrice(product.price, language)}
            </span>
            {outOfStock ? (
              <span className="badge bg-ink/10 text-ink/60">
                {t('product.outOfStock')}
              </span>
            ) : product.stock <= 5 ? (
              <span className="badge bg-blush-100 text-blush-700">
                {t('product.lowStock', { count: product.stock })}
              </span>
            ) : (
              <span className="badge bg-green-100 text-green-700">
                <CheckIcon className="mr-1 h-3.5 w-3.5" /> {t('product.inStock')}
              </span>
            )}
          </div>

          <div className="my-6 h-px bg-blush-100" />

          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/70">
            {t('product.description')}
          </h3>
          <p className="leading-relaxed text-ink/70">{description}</p>

          {/* actions */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink/70">
                {t('product.quantity')}
              </span>
              <QuantitySelector
                value={qty}
                onChange={setQty}
                max={Math.max(1, product.stock ?? 99)}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className="btn-primary flex-1"
            >
              <CartIcon className="h-5 w-5" />
              {t('product.addToCart')}
            </button>
            <button
              onClick={buyNow}
              disabled={outOfStock}
              className="btn-gold flex-1"
            >
              {t('cart.checkout')}
            </button>
          </div>

          {/* trust badges */}
          <div className="mt-8 grid grid-cols-1 gap-3 rounded-2xl bg-blush-50/60 p-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 text-sm">
              <TruckIcon className="h-5 w-5 text-plum-500" />
              <span className="text-ink/70">{t('home.promise2Text')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ShieldIcon className="h-5 w-5 text-plum-500" />
              <span className="text-ink/70">{t('home.promise1Text')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeading title={t('product.related')} />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}
