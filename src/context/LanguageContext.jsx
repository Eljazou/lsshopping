import { createContext, useContext, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, RTL_LANGUAGES } from '../i18n'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage || i18n.language || 'fr'
  const isRTL = RTL_LANGUAGES.includes(current)

  // Keep <html> lang/dir in sync with the active language.
  useEffect(() => {
    const dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('lang', current)
    document.documentElement.setAttribute('dir', dir)
  }, [current, isRTL])

  const changeLanguage = useCallback(
    (code) => {
      i18n.changeLanguage(code)
    },
    [i18n]
  )

  const value = useMemo(
    () => ({
      language: current,
      isRTL,
      languages: SUPPORTED_LANGUAGES,
      changeLanguage,
    }),
    [current, isRTL, changeLanguage]
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
