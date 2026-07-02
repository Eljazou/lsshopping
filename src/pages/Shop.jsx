import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getProducts } from '../services/dataService'
import { CATEGORY_KEYS } from '../data/categories'
import { useLanguage } from '../context/LanguageContext'
import { localized } from '../utils/format'
import ProductGrid from '../components/product/ProductGrid'
import Spinner from '../components/ui/Spinner'
import { SearchIcon, CloseIcon } from '../components/ui/icons'

const SORTS = ['newest', 'priceLow', 'priceHigh']

export default function Shop() {
  const { t } = useTranslation()
  const { language } = useLanguage()
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

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((p) => {
        const names = Object.values(p.name || {}).join(' ').toLowerCase()
        const descs = Object.values(p.description || {}).join(' ').toLowerCase()
        return names.includes(q) || descs.includes(q)
      })
    }

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

  return (
    <div className="container-x py-10 lg:py-14">
      {/* header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">{t('shop.title')}</h1>
        <span className="gold-divider mx-auto my-4" />
        <p className="text-sm text-ink/60">
          {t('shop.resultsCount', { count: filtered.length })}
        </p>
      </div>

      {/* search bar (mobile-visible) */}
      <form onSubmit={submitSearch} className="mx-auto mb-6 max-w-xl">
        <div className="flex items-center rounded-full border border-plum-100 bg-white px-4 focus-within:border-plum-300">
          <SearchIcon className="h-5 w-5 text-plum-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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

      {/* controls */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* category chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParam('category', 'all')}
            className={`badge border px-4 py-2 transition ${
              category === 'all'
                ? 'border-plum-400 bg-plum-500 text-white'
                : 'border-plum-100 bg-white text-ink hover:border-plum-300'
            }`}
          >
            {t('shop.allCategories')}
          </button>
          {CATEGORY_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => updateParam('category', key)}
              className={`badge border px-4 py-2 transition ${
                category === key
                  ? 'border-plum-400 bg-plum-500 text-white'
                  : 'border-plum-100 bg-white text-ink hover:border-plum-300'
              }`}
            >
              {t(`categories.${key}`)}
            </button>
          ))}
        </div>

        {/* sort */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-ink/60">{t('shop.sort')}</label>
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
    </div>
  )
}
