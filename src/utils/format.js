// Formatting helpers.

// Locale codes used by Intl for each app language.
const INTL_LOCALES = { en: 'en-US', fr: 'fr-MA', ar: 'ar-MA' }

// Format a price in Moroccan Dirham. We render the "DH" label ourselves so it
// stays consistent across languages (and matches the RTL layout for Arabic).
export function formatPrice(amount, language = 'fr') {
  const locale = INTL_LOCALES[language] || 'fr-MA'
  const num = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(amount ?? 0)
  return language === 'ar' ? `${num} درهم` : `${num} DH`
}

export function formatDate(value, language = 'fr') {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const locale = INTL_LOCALES[language] || 'fr-MA'
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Month + year only, e.g. "juillet 2026" — used for "member since".
export function formatMonthYear(value, language = 'fr') {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const locale = INTL_LOCALES[language] || 'fr-MA'
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date)
}

// Pick the localized field from a { en, fr, ar } object, with graceful fallback.
export function localized(field, language = 'fr') {
  if (field == null) return ''
  if (typeof field === 'string') return field
  return field[language] || field.fr || field.en || Object.values(field)[0] || ''
}
