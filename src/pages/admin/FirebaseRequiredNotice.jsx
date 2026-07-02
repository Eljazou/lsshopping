import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldIcon } from '../../components/ui/icons'

// Shown instead of the admin UI whenever VITE_USE_MOCK=true. The admin
// dashboard needs real Firebase Auth (and Storage for product images), which
// have no meaningful mock equivalent.
export default function FirebaseRequiredNotice() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen items-center justify-center bg-blush-50/60 px-4">
      <div className="card max-w-md p-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-plum-100 text-plum-600">
          <ShieldIcon className="h-7 w-7" />
        </span>
        <h1 className="mb-2 font-display text-2xl font-semibold">
          {t('admin.firebaseRequiredTitle')}
        </h1>
        <p className="text-sm leading-relaxed text-ink/60">
          {t('admin.firebaseRequiredText')}
        </p>
        <code className="mt-4 block rounded-xl bg-blush-50 px-3 py-2 text-xs text-plum-600">
          VITE_USE_MOCK=false
        </code>
        <Link to="/" className="btn-outline mt-6 inline-flex">
          {t('nav.home')}
        </Link>
      </div>
    </div>
  )
}
