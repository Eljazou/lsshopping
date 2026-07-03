import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  getProducts,
} from '../../services/dataService'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { formatDate, localized } from '../../utils/format'
import { PageLoader } from '../../components/ui/Spinner'
import StarRating from '../../components/product/StarRating'
import { CheckIcon, CloseIcon, TrashIcon } from '../../components/ui/icons'

const REVIEW_STATUSES = ['pending', 'approved', 'rejected']

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-rose-100 text-rose-700',
}

export default function AdminReviews() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { toast } = useToast()

  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')

  const load = () => {
    setLoading(true)
    Promise.all([getAllReviews(), getProducts()]).then(([r, p]) => {
      setReviews(r)
      setProducts(p)
      setLoading(false)
    })
  }

  useEffect(load, [])

  const productNames = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, localized(p.name, language)])),
    [products, language]
  )

  const filtered = useMemo(
    () => (statusFilter === 'all' ? reviews : reviews.filter((r) => r.status === statusFilter)),
    [reviews, statusFilter]
  )

  const counts = useMemo(() => {
    const c = { all: reviews.length, pending: 0, approved: 0, rejected: 0 }
    reviews.forEach((r) => {
      if (c[r.status] !== undefined) c[r.status] += 1
    })
    return c
  }, [reviews])

  const setStatus = async (review, status) => {
    setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, status } : r)))
    try {
      await updateReviewStatus(review.id, status)
      toast(t(`reviews.status.${status}`))
    } catch {
      toast('Update failed', 'error')
    }
  }

  const remove = async (review) => {
    if (!window.confirm(t('admin.deleteConfirm'))) return
    const prev = reviews
    setReviews((r) => r.filter((x) => x.id !== review.id))
    try {
      await deleteReview(review.id)
    } catch {
      setReviews(prev)
      toast('Delete failed', 'error')
    }
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', ...REVIEW_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`badge border px-4 py-2 transition ${
              statusFilter === s
                ? 'border-plum-400 bg-plum-500 text-white'
                : 'border-plum-100 bg-white text-ink hover:border-plum-300'
            }`}
          >
            {s === 'all' ? t('admin.allStatuses') : t(`reviews.status.${s}`)} · {counts[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center text-ink/50">{t('reviews.noneToModerate')}</div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((r) => (
            <li key={r.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-plum-500">
                    {productNames[r.productId] || r.productId}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-medium">{r.customerName}</span>
                    <span
                      className={`badge ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-600'}`}
                    >
                      {t(`reviews.status.${r.status}`)}
                    </span>
                  </div>
                  <StarRating value={r.rating} size="h-3.5 w-3.5" />
                </div>
                <span className="text-xs text-ink/40">{formatDate(r.createdAt, language)}</span>
              </div>

              {r.comment && <p className="mt-3 text-sm leading-relaxed text-ink/70">{r.comment}</p>}

              <div className="mt-4 flex gap-2 border-t border-blush-50 pt-4">
                {r.status !== 'approved' && (
                  <button
                    onClick={() => setStatus(r, 'approved')}
                    className="flex items-center gap-1 rounded-full border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                  >
                    <CheckIcon className="h-3.5 w-3.5" /> {t('reviews.approve')}
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button
                    onClick={() => setStatus(r, 'rejected')}
                    className="flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <CloseIcon className="h-3.5 w-3.5" /> {t('reviews.reject')}
                  </button>
                )}
                <button
                  onClick={() => remove(r)}
                  className="ms-auto flex h-8 w-8 items-center justify-center rounded-full border border-rose-100 text-rose-500 hover:bg-rose-50"
                  aria-label={t('admin.delete')}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
