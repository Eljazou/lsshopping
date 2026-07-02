import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getProducts } from '../services/dataService'
import { CATEGORY_KEYS } from '../data/categories'
import ProductGrid from '../components/product/ProductGrid'
import Spinner from '../components/ui/Spinner'
import {
  SearchIcon,
  CloseIcon,
  TruckIcon,
  ShieldIcon,
  HeartIcon,
  StarIcon,
  SparkleIcon,
  DropletIcon,
  LipstickIcon,
  ScissorsIcon,
  PerfumeIcon,
  LeafIcon,
  BrushIcon,
} from '../components/ui/icons'

const CATEGORY_ICON = {
  skincare: DropletIcon,
  makeup: LipstickIcon,
  haircare: ScissorsIcon,
  fragrance: PerfumeIcon,
  bodycare: LeafIcon,
  tools: BrushIcon,
}

export default function Shop() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const category = searchParams.get('category') || 'all'
  const sort = searchParams.get('sort') || 'newest'
  const query = searchParams.get('q') || ''
  const [searchInput, setSearchInput] = useState(query)

  useEffect(() => {
    let active = true
    getProducts().then((all) => {
      if (!active) return
      setProducts(all)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => setSearchInput(query), [query])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all' || value === '') next.delete(key)
    else next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    let list = [...products]

    if (category !== 'all') {
      list = list.filter((p) => p.category === category)
    }

    // Relevance score for a search match: name hits rank above
    // description-only hits, and an earlier match in the name ranks higher
    // still (e.g. "Rose Élixir" should beat "...with a hint of rose" for "rose").
    const relevance = (p, q) => {
      const names = Object.values(p.name || {}).join(' ').toLowerCase()
      const descs = Object.values(p.description || {}).join(' ').toLowerCase()
      const nameIndex = names.indexOf(q)
      if (nameIndex !== -1) return 1000 - nameIndex
      if (descs.includes(q)) return 0
      return -1
    }

    const q = query.trim().toLowerCase()
    if (q) {
      list = list
        .map((p) => ({ p, score: relevance(p, q) }))
        .filter((x) => x.score >= 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.p)
    } else {
      switch (sort) {
        case 'priceLow':
          list.sort((a, b) => a.price - b.price)
          break
        case 'priceHigh':
          list.sort((a, b) => b.price - a.price)
          break
        default: // newest
          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }
    }
    return list
  }, [products, category, sort, query])

  const submitSearch = (e) => {
    e.preventDefault()
    updateParam('q', searchInput.trim())
  }

  const clearAll = () => {
    setSearchInput('')
    setSearchParams({}, { replace: true })
  }

  const hasFilters = category !== 'all' || sort !== 'newest' || query

  const promises = [
    { icon: TruckIcon, title: 'promise2Title', text: 'promise2Text' },
    { icon: HeartIcon, title: 'promise1Title', text: 'promise1Text' },
    { icon: ShieldIcon, title: 'promise3Title', text: 'promise3Text' },
  ]

  return (
    <>
      {/* ───────────── decorative header banner ───────────── */}
      <section className="relative -mt-[68px] overflow-hidden bg-hero-gradient sm:-mt-20">
        <div className="pointer-events-none absolute -end-16 top-16 h-80 w-80 rounded-full bg-plum-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -start-20 h-80 w-80 rounded-full bg-blush-300/25 blur-3xl" />

        <div className="container-x relative pb-10 pt-28 text-center lg:pt-32">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-plum-600 shadow-sm animate-fade-in">
            <SparkleIcon className="h-3.5 w-3.5" />
            {t('brand.tagline')}
          </span>
          <h1 className="animate-fade-in-up text-4xl font-semibold sm:text-5xl">
            {t('shop.title')}
          </h1>
          <span className="gold-divider mx-auto my-4" />
          <p className="mb-6 text-sm text-ink/60">
            {t('shop.resultsCount', { count: filtered.length })}
          </p>

          {/* trust pills — inline, no overlap with the navbar */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-gold">
                <StarIcon className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-medium text-ink/70">4.9/5 avis clientes</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-plum-100 text-plum-600">
                <TruckIcon className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-medium text-ink/70">{t('checkout.cod')}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container-x py-10 lg:py-14">
        {/* search bar */}
        <form onSubmit={submitSearch} className="mx-auto mb-6 max-w-xl">
          <div className="flex items-center rounded-full border border-plum-100 bg-white px-4 shadow-card focus-within:border-plum-300">
            <SearchIcon className="h-5 w-5 text-plum-400" />
            <input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                updateParam('q', e.target.value)
              }}
              placeholder={t('nav.search')}
              className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-plum-300"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  updateParam('q', '')
                }}
                className="text-plum-300 hover:text-blush-600"
                aria-label={t('common.close')}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        {/* controls card — categories (scrollable) and sort share one row */}
        <div className="card mb-10 flex items-center gap-3 p-3 sm:p-4">
          <div className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
            <button
              onClick={() => updateParam('category', 'all')}
              className={`badge shrink-0 gap-1.5 border px-4 py-2 transition ${
                category === 'all'
                  ? 'border-plum-400 bg-gradient-to-r from-blush-500 to-plum-500 text-white shadow-sm'
                  : 'border-plum-100 bg-white text-ink hover:border-plum-300'
              }`}
            >
              <SparkleIcon className="h-3.5 w-3.5" />
              {t('shop.allCategories')}
            </button>
            {CATEGORY_KEYS.map((key) => {
              const Icon = CATEGORY_ICON[key]
              return (
                <button
                  key={key}
                  onClick={() => updateParam('category', key)}
                  className={`badge shrink-0 gap-1.5 border px-4 py-2 transition ${
                    category === key
                      ? 'border-plum-400 bg-gradient-to-r from-blush-500 to-plum-500 text-white shadow-sm'
                      : 'border-plum-100 bg-white text-ink hover:border-plum-300'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t(`categories.${key}`)}
                </button>
              )
            })}
          </div>

          <div className="hidden h-8 w-px shrink-0 bg-blush-100 sm:block" />

          <div className="flex shrink-0 items-center gap-2">
            <label className="hidden text-sm text-ink/60 sm:inline">{t('shop.sort')}</label>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="input !w-auto !py-2 !px-3 cursor-pointer"
            >
              <option value="newest">{t('shop.sortNewest')}</option>
              <option value="priceLow">{t('shop.sortPriceLow')}</option>
              <option value="priceHigh">{t('shop.sortPriceHigh')}</option>
            </select>
          </div>
        </div>

        {/* results */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner className="h-10 w-10" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="text-lg text-ink/60">{t('shop.noResults')}</p>
            {hasFilters && (
              <button onClick={clearAll} className="btn-outline">
                {t('shop.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <ProductGrid products={filtered} />
        )}

        {/* trust strip — fills the page and reinforces the brand promise */}
        <div className="mt-16 grid gap-6 rounded-3xl bg-blush-50/60 p-6 sm:grid-cols-3 sm:p-8">
          {promises.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-plum-500 shadow-sm">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{t(`home.${title}`)}</p>
                <p className="text-xs text-ink/50">{t(`home.${text}`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
