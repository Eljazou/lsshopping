import { useTranslation } from 'react-i18next'

const STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-rose-100 text-rose-700',
}

// Same palette, tuned for an interactive <select> (softer fill + a visible
// border since it needs to read as clickable, not just informational).
// `!` forces these to win over .input's own border/focus colors, since that
// base class lives in the Tailwind "components" layer (lower priority than
// plain utility classes) but focus: state still needs the extra push.
export const STATUS_SELECT_STYLES = {
  pending: '!border-amber-200 !bg-amber-50 !text-amber-700 focus:!border-amber-300 focus:!ring-amber-100',
  confirmed: '!border-blue-200 !bg-blue-50 !text-blue-700 focus:!border-blue-300 focus:!ring-blue-100',
  delivered: '!border-green-200 !bg-green-50 !text-green-700 focus:!border-green-300 focus:!ring-green-100',
  cancelled: '!border-rose-200 !bg-rose-50 !text-rose-700 focus:!border-rose-300 focus:!ring-rose-100',
}

export default function StatusBadge({ status }) {
  const { t } = useTranslation()
  return (
    <span className={`badge ${STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {t(`admin.status.${status}`)}
    </span>
  )
}
