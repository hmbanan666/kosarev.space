export const githubOwner = 'hmbanan666'
export interface ActivityItem { id: string, kind: 'commit' | 'pr' | 'release', repo: string, title: string, date: string, url: string }
export interface ActivityDay { date: string, count: number }
export interface ActivityRepo { name: string, project?: string, url: string, languages: Record<string, number> }
export interface ActivitySnapshot {
  fetchedAt: string | null
  repos: ActivityRepo[]
  items: ActivityItem[]
  calendar: ActivityDay[]
  coverage: 'unavailable' | 'rest90' | 'publicYear'
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
