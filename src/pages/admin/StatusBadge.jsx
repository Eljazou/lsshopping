import { useTranslation } from 'react-i18next'

const STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-rose-100 text-rose-700',
}

export default function StatusBadge({ status }) {
  const { t } = useTranslation()
  return (
    <span className={`badge ${STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {t(`admin.status.${status}`)}
    </span>
  )
}
