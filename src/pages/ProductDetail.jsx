import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getProduct, getProducts, getApprovedReviews, addReview } from '../services/dataService'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'
import { formatPrice, formatDate, localized } from '../utils/format'
import ProductImage from '../components/ui/ProductImage'
import QuantitySelector from '../components/ui/QuantitySelector'
import ProductGrid from '../components/product/ProductGrid'
import SectionHeading from '../components/ui/SectionHeading'
import StarRating from '../components/product/StarRating'
import Spinner, { PageLoader } from '../components/ui/Spinner'
import { CartIcon, ArrowRight, TruckIcon, ShieldIcon, CheckIcon } from '../components/ui/icons'

const EMPTY_REVIEW_FORM = { customerName: '', rating: 0, comment: '' }

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

  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState(EMPTY_REVIEW_FORM)
  const [submittingReview, setSubmittingReview] = useState(false)

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

  useEffect(() => {
    let active = true
    setReviewsLoading(true)
    setReviewForm(EMPTY_REVIEW_FORM)
    getApprovedReviews(id).then((r) => {
      if (!active) return
      setReviews(r)
      setReviewsLoading(false)
    })
    return () => {
      active = false
    }
  }, [id])

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  }, [reviews])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewForm.customerName.trim() || !reviewForm.rating) {
      toast(t('reviews.formIncomplete'), 'error')
      return
    }
    setSubmittingReview(true)
    try {
      await addReview({
        productId: id,
        customerName: reviewForm.customerName.trim(),
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      })
      setReviewForm(EMPTY_REVIEW_FORM)
      toast(t('reviews.submitted'))
    } catch (err) {
      console.error(err)
      toast(t('reviews.submitFailed'), 'error')
    } finally {
      setSubmittingReview(false)
    }
  }

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

          {!reviewsLoading && reviews.length > 0 && (
            <a href="#reviews" className="mt-2 flex items-center gap-2 text-sm">
              <StarRating value={avgRating} />
              <span className="text-ink/60">
                {avgRating.toFixed(1)} · {t('reviews.count', { count: reviews.length })}
              </span>
            </a>
          )}

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

      {/* reviews */}
      <section id="reviews" className="mt-20 scroll-mt-24">
        <SectionHeading
          title={t('reviews.title')}
          subtitle={
            reviews.length > 0
              ? `${avgRating.toFixed(1)} / 5 · ${t('reviews.count', { count: reviews.length })}`
              : t('reviews.none')
          }
        />

        <div className="grid gap-8 lg:grid-cols-5">
          {/* list */}
          <div className="lg:col-span-3">
            {reviewsLoading ? (
              <div className="flex justify-center py-10">
                <Spinner className="h-8 w-8" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink/50">{t('reviews.beFirst')}</p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="card p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{r.customerName}</span>
                      <span className="text-xs text-ink/40">{formatDate(r.createdAt, language)}</span>
                    </div>
                    <StarRating value={r.rating} size="h-3.5 w-3.5" />
                    {r.comment && <p className="mt-2 text-sm leading-relaxed text-ink/70">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* submit form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleReviewSubmit} className="card space-y-4 p-5">
              <h3 className="font-display text-lg font-semibold">{t('reviews.writeTitle')}</h3>

              <div>
                <label className="label">{t('reviews.yourRating')}</label>
                <StarRating
                  value={reviewForm.rating}
                  onChange={(n) => setReviewForm((f) => ({ ...f, rating: n }))}
                  size="h-6 w-6"
                />
              </div>

              <div>
                <label className="label" htmlFor="review-name">
                  {t('checkout.fullName')}
                </label>
                <input
                  id="review-name"
                  value={reviewForm.customerName}
                  onChange={(e) => setReviewForm((f) => ({ ...f, customerName: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="review-comment">
                  {t('reviews.yourComment')}
                </label>
                <textarea
                  id="review-comment"
                  rows={3}
                  maxLength={500}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  className="input resize-none"
                  placeholder={t('reviews.commentPlaceholder')}
                />
              </div>

              <button type="submit" disabled={submittingReview} className="btn-primary w-full">
                {submittingReview ? <Spinner className="h-5 w-5" /> : t('reviews.submitCta')}
              </button>
              <p className="text-center text-xs text-ink/40">{t('reviews.moderationNotice')}</p>
            </form>
          </div>
        </div>
      </section>

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
