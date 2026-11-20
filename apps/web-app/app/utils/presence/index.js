import { names as enNames, ui as enUi } from './en.js'
import { names as ruNames, ui as ruUi } from './ru.js'

const fallback = { names: enNames, ui: enUi }
export const locales = {
  en: fallback,
  ru: { names: ruNames, ui: ruUi },
}
export function getLocale(locale) {
  return locales[locale] ?? fallback
}
