import type { ActivityDay } from './activity'

interface ContributionMonth { month: string, count: number }

// Dates are snapshot UTC dates. Missing days break a streak; ties keep the earliest.
export function contributionSummary(days: ActivityDay[]) {
  let total = 0
  let activeDays = 0
  let longestStreak = 0
  let streak = 0
  let previousDate = 0
  let busiestDay: ActivityDay | undefined
  const monthly = new Map<string, number>()
  for (const day of days.toSorted((a, b) => a.date.localeCompare(b.date))) {
    const date = Date.parse(`${day.date}T00:00:00Z`)
    total += day.count
    const month = day.date.slice(0, 7)
    monthly.set(month, (monthly.get(month) ?? 0) + day.count)
    if (day.count > 0) {
      activeDays++
      streak = date - previousDate === 86400000 ? streak + 1 : 1
      longestStreak = Math.max(longestStreak, streak)
      if (day.count > (busiestDay?.count ?? 0)) {
        busiestDay = day
      }
    } else {
      streak = 0
    }
    previousDate = date
  }
  const months = Array.from(monthly, ([month, count]) => ({ month, count }))
  const busiestMonth = months.reduce<ContributionMonth | undefined>((best, month) => month.count > (best?.count ?? 0) ? month : best, undefined)
  return { total, activeDays, longestStreak, months, busiestDay, busiestMonth }
}
