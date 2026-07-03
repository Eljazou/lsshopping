import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { UserIcon, ChevronDown } from '../ui/icons'

// Profile icon in the navbar. Logged out: a plain link to /connexion.
// Logged in: a small dropdown (same pattern as LanguageSwitcher) with a
// link to the account page and a one-click logout — no need to open the
// account page just to sign out.
export default function AccountMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthed, profile, user, logout } = useCustomerAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!isAuthed) {
    return (
      <Link
        to="/connexion"
        className="relative rounded-full p-2 text-ink transition hover:bg-blush-50"
        aria-label={t('nav.account')}
      >
        <UserIcon className="h-6 w-6" />
      </Link>
    )
  }

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center gap-1 rounded-full p-1.5 text-ink transition hover:bg-blush-50"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('nav.account')}
      >
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt=""
            className="h-7 w-7 rounded-full object-cover ring-1 ring-plum-200"
          />
        ) : (
          <span className="relative flex h-7 w-7 items-center justify-center">
            <UserIcon className="h-6 w-6" />
            <span className="absolute end-0 top-0 h-2 w-2 rounded-full bg-plum-500 ring-2 ring-white" />
          </span>
        )}
        <ChevronDown className="hidden h-3.5 w-3.5 text-plum-400 sm:block" />
      </button>

      {open && (
        <div
          className="absolute end-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl bg-white p-1 shadow-soft ring-1 ring-black/5 animate-fade-in"
          role="menu"
        >
          <div className="truncate px-3 py-2 text-xs text-ink/40">
            {profile?.email || user?.email}
          </div>
          <Link
            to="/compte"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm text-ink transition hover:bg-blush-50"
            role="menuitem"
          >
            {t('account.myAccount')}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full rounded-xl px-3 py-2 text-start text-sm text-blush-600 transition hover:bg-blush-50"
            role="menuitem"
          >
            {t('account.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
