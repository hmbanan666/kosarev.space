import { calcMonths, formatAge, formatDuration } from '~/utils/duration'

export function useDuration() {
  const { locale } = useI18n()

  function getDuration(exp: { startYear: number, startMonth: number, endYear?: number, endMonth?: number, present?: boolean }) {
    const now = new Date()
    const endYear = exp.present ? now.getFullYear() : (exp.endYear ?? exp.startYear)
    const endMonth = exp.present ? now.getMonth() + 1 : (exp.endMonth ?? exp.startMonth)
    return formatDuration(calcMonths(exp.startYear, exp.startMonth, endYear, endMonth), locale.value)
  }

  function getTotalDuration(startYear: number, startMonth: number) {
    const now = new Date()
    return formatDuration(calcMonths(startYear, startMonth, now.getFullYear(), now.getMonth() + 1), locale.value)
  }

  return {
    formatDuration: (totalMonths: number) => formatDuration(totalMonths, locale.value),
    formatAge: (years: number) => formatAge(years, locale.value),
    getDuration,
    getTotalDuration,
  }
}
