export function pluralRu(n: number, one: string, few: string, many: string) {
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

export function pluralEn(n: number, word: string) {
  return `${n} ${word}${n > 1 ? 's' : ''}`
}

export function formatDuration(totalMonths: number, locale: string) {
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  const parts: string[] = []
  const isRu = locale === 'ru'

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

export function formatAge(years: number, locale: string) {
  if (locale === 'ru') {
    return pluralRu(years, 'год', 'года', 'лет')
  }
  return `${years} years old`
}

export function calcMonths(startYear: number, startMonth: number, endYear: number, endMonth: number) {
  return (endYear - startYear) * 12 + (endMonth - startMonth)
}
