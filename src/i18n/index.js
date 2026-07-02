import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', dir: 'rtl', flag: '🇲🇦' },
]

export const RTL_LANGUAGES = SUPPORTED_LANGUAGES.filter(
  (l) => l.dir === 'rtl'
).map((l) => l.code)

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar },
    },
    fallbackLng: 'fr',
    supportedLngs: ['en', 'fr', 'ar'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'eclat_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
