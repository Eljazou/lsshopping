import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { GlobeIcon, ChevronDown } from '../ui/icons'

export default function LanguageSwitcher({ compact = false }) {
  const { language, languages, changeLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const active = languages.find((l) => l.code === language) || languages[0]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink transition hover:bg-blush-50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <GlobeIcon className="h-4 w-4 text-plum-500" />
        {!compact && <span>{active.label}</span>}
        <span className={compact ? 'text-base' : 'hidden sm:inline text-base'}>
          {active.flag}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-plum-400" />
      </button>

      {open && (
        <ul
          className="absolute end-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl bg-white p-1 shadow-soft ring-1 ring-black/5 animate-fade-in"
          role="listbox"
        >
          {languages.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => {
                  changeLanguage(l.code)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-blush-50 ${
                  l.code === language ? 'font-semibold text-plum-600' : 'text-ink'
                }`}
                dir={l.dir}
              >
                <span className="text-base">{l.flag}</span>
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
