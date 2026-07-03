import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CATEGORIES } from '../../data/categories'

const Social = ({ label, d, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-gold"
  >
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d={d} />
    </svg>
  </a>
)

// Store's social / messaging links — update here if they ever change.
const WHATSAPP_NUMBER = '212606064342' // 06 06 06 43 42, in international format
const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/ls_shopping_lilystore?igsh=eGx4MTNjYnU1NnJ2',
  tiktok: 'https://www.tiktok.com/@ls_shopping?_r=1&_t=ZS-97hMrJoq8ts',
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`,
}

export default function Footer() {
  const { t } = useTranslation()
  const year = 2025

  const helpLinks = [
    { key: 'contact' },
    { key: 'shipping' },
    { key: 'returns' },
    { key: 'privacy' },
    { key: 'terms' },
  ]

  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="container-x grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* brand */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <img
              src="/lslogo.png"
              alt="L&S Shopping"
              className="h-10 w-10 rounded-full object-cover ring-1 ring-gold/40"
            />
            <span className="font-display text-2xl font-semibold">{t('brand.name')}</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            {t('footer.aboutText')}
          </p>
          <div className="mt-5 flex gap-3">
            <Social
              label="Instagram"
              href={SOCIAL_LINKS.instagram}
              d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.1.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.1-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.1-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.1 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1-.4 2.1C2.6 9.9 2.6 10.3 2.6 12s0 2.1.1 3.3c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-3.3s0-2.1-.1-3.3c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.3-.4-.4-.8-.6-1.3-.8-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 8.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zm6.3-8.3a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z"
            />
            <Social
              label="WhatsApp"
              href={SOCIAL_LINKS.whatsapp}
              d="M12.04 2c-5.5 0-10 4.5-10 10 0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10s-4.5-10-9.96-10zm0 18.3c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3c-.9-1.4-1.3-2.9-1.3-4.5 0-4.6 3.7-8.3 8.3-8.3 4.6 0 8.3 3.7 8.3 8.3.1 4.6-3.6 8.4-8.2 8.4zm4.5-6.2c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8.9-.1.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.6-1.2-1.4-1.4-1.6-.1-.2 0-.4.1-.5.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4 0-.5C10.2 9.5 9.7 8.3 9.5 7.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 2 3 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.2-.5-.3z"
            />
            <Social
              label="TikTok"
              href={SOCIAL_LINKS.tiktok}
              d="M16.5 3c.3 1.8 1.4 3.3 3 3.9V10c-1.2 0-2.3-.4-3.3-1v5.4a5.4 5.4 0 1 1-5.4-5.4c.3 0 .6 0 .9.1v3a2.4 2.4 0 1 0 1.7 2.3V3h3.1z"
            />
          </div>
        </div>

        {/* shop categories */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-light">
            {t('footer.shop')}
          </h4>
          <ul className="space-y-2 text-sm text-white/60">
            {CATEGORIES.map((c) => (
              <li key={c.key}>
                <Link
                  to={`/shop?category=${c.key}`}
                  className="transition hover:text-white"
                >
                  {t(`categories.${c.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* help */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-light">
            {t('footer.help')}
          </h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li>
              <Link to="/suivi" className="transition hover:text-white">
                {t('footer.tracking')}
              </Link>
            </li>
            {helpLinks.map((l) => (
              <li key={l.key}>
                <a href="#" className="transition hover:text-white">
                  {t(`footer.${l.key}`)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* contact */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-light">
            {t('footer.contact')}
          </h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li>📍 Casablanca, Maroc</li>
            <li>
              <a href="tel:+212606064342" className="transition hover:text-white">
                📞 +212 6 06 06 43 42
              </a>
            </li>
            <li>
              <a
                href="mailto:contact@ls-shopping.ma"
                className="transition hover:text-white"
              >
                ✉️ contact@ls-shopping.ma
              </a>
            </li>
          </ul>
          <Link to="/admin" className="mt-4 inline-block text-xs text-white/30 hover:text-white/60">
            {t('nav.admin')}
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/40 sm:flex-row">
          <span>
            © {year} {t('brand.name')}. {t('footer.rights')}
          </span>
          <span>{t('footer.madeWith')} · 🇲🇦</span>
        </div>
      </div>
    </footer>
  )
}
