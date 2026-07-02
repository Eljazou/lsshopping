import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getProducts } from '../services/dataService'
import { CATEGORIES } from '../data/categories'
import ProductGrid from '../components/product/ProductGrid'
import CategoryCard from '../components/product/CategoryCard'
import SectionHeading from '../components/ui/SectionHeading'
import Spinner from '../components/ui/Spinner'
import { ArrowRight, TruckIcon, ShieldIcon, HeartIcon } from '../components/ui/icons'

export default function Home() {
  const { t } = useTranslation()
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getProducts().then((all) => {
      if (!active) return
      const feat = all.filter((p) => p.featured).slice(0, 8)
      setFeatured(feat.length ? feat : all.slice(0, 8))
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const promises = [
    { icon: TruckIcon, title: 'promise2Title', text: 'promise2Text' },
    { icon: HeartIcon, title: 'promise1Title', text: 'promise1Text' },
    { icon: ShieldIcon, title: 'promise3Title', text: 'promise3Text' },
  ]

  return (
    <>
      {/* ───────────── Hero ───────────── */}
      {/* Pulled up behind the (transparent) floating navbar so the hero
          gradient fills the whole top — no separate band, no seam. */}
      <section className="relative -mt-[68px] overflow-hidden bg-hero-gradient sm:-mt-20">
        <div className="pointer-events-none absolute -end-24 top-28 h-96 w-96 rounded-full bg-blush-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -start-24 h-96 w-96 rounded-full bg-plum-200/40 blur-3xl" />

        <div className="container-x relative grid items-center gap-10 pb-16 pt-8 lg:grid-cols-2 lg:pb-24 lg:pt-28">
          <div className="animate-fade-in-up text-center lg:text-start">
            <span className="mb-4 inline-block rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-plum-600 shadow-sm">
              {t('home.heroEyebrow')}
            </span>
            <h1 className="text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
              {t('home.heroTitle')}
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base text-ink/60 lg:mx-0 lg:text-lg">
              {t('home.heroSubtitle')}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link to="/shop" className="btn-primary group w-full sm:w-auto">
                {t('home.heroCta')}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
              <a href="#categories" className="btn-outline w-full sm:w-auto">
                {t('home.heroCtaSecondary')}
              </a>
            </div>
          </div>

          <div className="relative animate-fade-in">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-lg overflow-hidden rounded-[2.5rem] shadow-soft lg:max-h-[500px]">
              <img
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&q=80"
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg,#ffe9f1,#f0e9ff)'
                  e.currentTarget.removeAttribute('src')
                }}
              />
              <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-white/40" />
            </div>
            <div className="absolute -bottom-4 start-2 flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-3 shadow-card backdrop-blur sm:start-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold">
                <TruckIcon className="h-5 w-5" />
              </span>
              <div className="text-start">
                <p className="text-sm font-semibold leading-tight">
                  {t('home.promise1Title')}
                </p>
                <p className="text-xs text-ink/50">{t('home.promise2Text')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Promises ───────────── */}
      <section className="border-y border-blush-100 bg-white">
        <div className="container-x grid gap-6 py-8 sm:grid-cols-3">
          {promises.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 justify-center sm:justify-start">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush-50 text-plum-500">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{t(`home.${title}`)}</p>
                <p className="text-xs text-ink/50">{t(`home.${text}`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── Categories ───────────── */}
      <section id="categories" className="container-x py-16 lg:py-20">
        <SectionHeading
          eyebrow={t('home.categoriesTitle')}
          title={t('home.categoriesTitle')}
          subtitle={t('home.categoriesSubtitle')}
        />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.key} category={c} />
          ))}
        </div>
      </section>

      {/* ───────────── Featured ───────────── */}
      <section className="bg-blush-50/50 py-16 lg:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow={t('brand.tagline')}
            title={t('home.featuredTitle')}
            subtitle={t('home.featuredSubtitle')}
          />
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-10 w-10" />
            </div>
          ) : (
            <ProductGrid products={featured} />
          )}
          <div className="mt-10 flex justify-center">
            <Link to="/shop" className="btn-gold group">
              {t('home.viewAll')}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── Brand banner ───────────── */}
      <section className="container-x py-16">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-plum-600 to-blush-500 px-6 py-14 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -end-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <span className="gold-divider mx-auto mb-5 !w-16 !bg-gold-light/70" />
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold sm:text-4xl">
            {t('brand.tagline')}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/80">
            {t('home.promiseTitle')} — {t('home.promise3Text')}
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex rounded-full bg-white px-7 py-3 text-sm font-semibold text-plum-700 transition hover:bg-blush-50"
          >
            {t('home.heroCta')}
          </Link>
        </div>
      </section>
    </>
  )
}
