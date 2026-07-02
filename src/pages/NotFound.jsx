import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <span className="font-display text-8xl font-semibold text-plum-200">404</span>
      <p className="text-lg text-ink/60">{t('shop.noResults')}</p>
      <Link to="/" className="btn-primary">
        {t('nav.home')}
      </Link>
    </div>
  )
}
