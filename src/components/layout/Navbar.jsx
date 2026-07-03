import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../context/CartContext'
import LanguageSwitcher from './LanguageSwitcher'
import CartDrawer from '../cart/CartDrawer'
import { CartIcon, SearchIcon, MenuIcon, CloseIcon } from '../ui/icons'

export default function Navbar() {
  const { t } = useTranslation()
  const { count } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [search, setSearch] = useState('')

  // Keep the navbar search box in sync with the Shop page's own search box
  // (e.g. if the user clears it from there, or lands on a shared /shop?q= link).
  useEffect(() => {
    setSearch(location.pathname === '/shop' ? searchParams.get('q') || '' : '')
  }, [location.pathname, searchParams])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu on route change.
  useEffect(() => setMenuOpen(false), [location.pathname])

  // Live search: filters the Shop page as soon as the user types, no submit
  // needed. Uses `replace` once already on /shop so keystrokes don't spam
  // browser history, but `push` the first time to actually navigate there.
  const handleSearchChange = (value) => {
    setSearch(value)
    const qs = value.trim() ? `?q=${encodeURIComponent(value.trim())}` : ''
    navigate(`/shop${qs}`, { replace: location.pathname === '/shop' })
  }

  const submitSearch = (e) => {
    e.preventDefault()
  }

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-medium transition hover:text-plum-600 ${
      isActive ? 'text-plum-600' : 'text-ink'
    }`

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/shop', label: t('nav.shop') },
    { to: '/suivi', label: t('nav.tracking') },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 pt-3 sm:pt-4">
        <div className="mx-auto max-w-6xl px-3 sm:px-5">
          <div
            className={`liquid-glass ${
              scrolled ? 'liquid-glass--scrolled' : ''
            } flex h-14 items-center justify-between gap-4 rounded-full px-3 transition-all duration-300 sm:h-16 sm:px-5`}
          >
          {/* left: mobile menu + logo */}
          <div className="flex items-center gap-2">
            <button
              className="rounded-full p-2 text-ink hover:bg-blush-50 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label={t('common.menu')}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/lslogo.png"
                alt="L&S Shopping"
                className="h-10 w-10 rounded-full object-cover shadow-sm ring-1 ring-gold/40"
              />
              <span className="font-display text-2xl font-semibold tracking-tight">
                {t('brand.name')}
              </span>
            </Link>
          </div>

          {/* center: nav links (desktop) */}
          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={navLinkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* right: search + lang + cart */}
          <div className="flex items-center gap-1 sm:gap-2">
            <form onSubmit={submitSearch} className="hidden md:block">
              <div className="flex items-center rounded-full border border-white/60 bg-white/40 px-3 backdrop-blur-sm transition focus-within:border-white/90 focus-within:bg-white/70">
                <SearchIcon className="h-4 w-4 text-plum-400" />
                <input
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t('nav.search')}
                  className="w-36 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-plum-300 lg:w-48"
                />
              </div>
            </form>

            <LanguageSwitcher compact />

            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full p-2 text-ink transition hover:bg-blush-50"
              aria-label={t('nav.cart')}
            >
              <CartIcon className="h-6 w-6" />
              {count > 0 && (
                <span className="absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blush-500 px-1 text-[11px] font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
          </div>
        </div>
      </header>

      {/* mobile drawer menu */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          menuOpen ? '' : 'pointer-events-none'
        }`}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <nav
          className={`absolute inset-y-0 start-0 w-72 max-w-[80%] bg-white p-6 shadow-2xl transition-transform ${
            menuOpen ? 'translate-x-0' : 'rtl:translate-x-full ltr:-translate-x-full'
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <span className="font-display text-2xl font-semibold">{t('brand.name')}</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="rounded-full p-2 hover:bg-blush-50"
              aria-label={t('common.close')}
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={submitSearch} className="mb-6">
            <div className="input flex items-center gap-2">
              <SearchIcon className="h-4 w-4 text-plum-400" />
              <input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('nav.search')}
                className="w-full bg-transparent text-sm outline-none placeholder:text-plum-300"
              />
            </div>
          </form>

          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-base font-medium transition ${
                    isActive ? 'bg-blush-50 text-plum-600' : 'text-ink hover:bg-blush-50'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/admin"
              className="rounded-2xl px-4 py-3 text-base font-medium text-ink/50 hover:bg-blush-50"
            >
              {t('nav.admin')}
            </Link>
          </div>
        </nav>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
