export const githubOwner = 'hmbanan666'
export interface ActivityItem { id: string, kind: 'commit' | 'pr' | 'release', repo: string, title: string, date: string, url: string }
export interface ActivityDay { date: string, count: number }
export interface ActivityRepo { name: string, project?: string, url: string, languages: Record<string, number> }
export interface ActivitySnapshot {
  fetchedAt: string | null
  repos: ActivityRepo[]
  items: ActivityItem[]
  calendar: ActivityDay[]
  calendarTotal?: number
  coverage: 'unavailable' | 'rest90' | 'githubYear'
  partial: boolean
}
export function emptyActivity(): ActivitySnapshot {
  return { fetchedAt: null, repos: [], items: [], calendar: [], coverage: 'unavailable', partial: true }
}
const dayMs = 86400000
export function activityScore(items: Pick<ActivityItem, 'kind' | 'date'>[], now: string): number {
  const ages = items.filter((item) => item.kind !== 'release').map((item) => (Date.parse(now) - Date.parse(item.date)) / dayMs).filter((age) => age >= 0 && age < 30)
  if (!ages.length) {
    return 0
  }
  return Math.max(0, 30 - Math.floor(Math.min(...ages))) + ages.length + ages.filter((age) => age < 14).length
}
export function calendarDays(items: Pick<ActivityItem, 'kind' | 'date'>[], now: string, length: number): ActivityDay[] {
  const end = Date.parse(`${now.slice(0, 10)}T00:00:00Z`)
  return Array.from({ length }, (_, index) => {
    const date = new Date(end - (length - index - 1) * dayMs).toISOString().slice(0, 10)
    return { date, count: items.filter((item) => item.kind !== 'release' && item.date.slice(0, 10) === date && item.date <= now).length }
  })
}
export function projectScores(snapshot: ActivitySnapshot): Record<string, number> {
  return Object.fromEntries(snapshot.repos.filter((repo) => repo.project).map((repo) => [repo.project!, activityScore(snapshot.items.filter((item) => item.repo === repo.name), snapshot.fetchedAt ?? '')]))
}

export function projectCommitItems(items: ActivityItem[]): ActivityItem[] {
  return items.filter((item) => item.kind === 'commit' && !/^Merge (?:pull request|branch|remote-tracking branch)/.test(item.title))
}

// Keep raw observations for project graphs/ranking; collapse only feed rows.
export function activityFeedItems(items: ActivityItem[]): ActivityItem[] {
  const pulls = new Map(items.filter((item) => item.kind === 'pr').map((item) => [`${item.repo}:${item.url.match(/\/pull\/(\d+)$/)?.[1]}`, item]))
  const seen = new Set<string>()
  return items.flatMap((item) => {
    const number = item.kind === 'commit' ? item.title.match(/\(#(\d+)\)$/)?.[1] : undefined
    const row = number ? pulls.get(`${item.repo}:${number}`) ?? item : item
    if (seen.has(row.id)) {
      return []
    }
    seen.add(row.id)
    return [row]
  })
}
