export function useDuration() {
  const { locale } = useI18n()

  function pluralRu(n: number, one: string, few: string, many: string) {
    const lastTwo = n % 100
    const lastOne = n % 10
    if (lastTwo >= 11 && lastTwo <= 19) {
      return `${n} ${many}`
    }
    if (lastOne === 1) {
      return `${n} ${one}`
    }
    if (lastOne >= 2 && lastOne <= 4) {
      return `${n} ${few}`
    }
    return `${n} ${many}`
  }

  function pluralEn(n: number, word: string) {
    return `${n} ${word}${n > 1 ? 's' : ''}`
  }

  function formatDuration(totalMonths: number) {
    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12
    const parts: string[] = []
    const isRu = locale.value === 'ru'

    if (isRu) {
      if (years > 0) {
        parts.push(pluralRu(years, 'год', 'года', 'лет'))
      }
      if (months > 0) {
        parts.push(pluralRu(months, 'месяц', 'месяца', 'месяцев'))
      }
    } else {
      if (years > 0) {
        parts.push(pluralEn(years, 'yr'))
      }
      if (months > 0) {
        parts.push(`${months} mo`)
      }
    }

    return parts.join(' ') || (isRu ? '< 1 месяца' : '< 1 mo')
  }

  function formatAge(years: number) {
    if (locale.value === 'ru') {
      return pluralRu(years, 'год', 'года', 'лет')
    }
    return `${years} years old`
  }

  function calcMonths(startYear: number, startMonth: number, endYear: number, endMonth: number) {
    return (endYear - startYear) * 12 + (endMonth - startMonth)
  }

  function getDuration(exp: { startYear: number, startMonth: number, endYear?: number, endMonth?: number, present?: boolean }) {
    const now = new Date()
    const endYear = exp.present ? now.getFullYear() : (exp.endYear ?? exp.startYear)
    const endMonth = exp.present ? now.getMonth() + 1 : (exp.endMonth ?? exp.startMonth)
    return formatDuration(calcMonths(exp.startYear, exp.startMonth, endYear, endMonth))
  }

  function getTotalDuration(startYear: number, startMonth: number) {
    const now = new Date()
    return formatDuration(calcMonths(startYear, startMonth, now.getFullYear(), now.getMonth() + 1))
  }

  return { formatDuration, formatAge, getDuration, getTotalDuration }
}
