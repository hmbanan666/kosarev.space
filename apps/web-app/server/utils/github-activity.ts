import type { ActivitySnapshot } from '../../shared/activity'
import { calendarDays, githubOwner } from '../../shared/activity'
import { projectRepos } from './activity-projects'

interface Repo { full_name: string, private: boolean, fork: boolean, html_url: string, pushed_at: string }
interface Commit { sha: string, html_url: string, commit: { message: string, author: { date: string } } }
interface Pull { number: number, title: string, html_url: string, created_at: string, user: { login: string } }
interface PublicEvent { id: string, public: boolean, type: string, repo: { name: string }, created_at: string, payload: { release?: { name: string, tag_name: string, html_url: string } } }
export type GithubRequest = (path: string, body?: { query: string }) => Promise<unknown>
// A public listing is the allowlist even when the optional token can see more.
export async function fetchPublicActivity(request: GithubRequest, now: string, withCalendar = false): Promise<ActivitySnapshot> {
  const repos: Repo[] = []
  let partial = false
  for (let page = 1; page <= 10; page++) {
    const batch = await request(`/users/${githubOwner}/repos?type=owner&sort=pushed&per_page=100&page=${page}`) as Repo[]
    repos.push(...batch.filter((repo) => repo.private === false && !repo.fork && repo.full_name.startsWith(`${githubOwner}/`)))
    if (batch.length < 100) {
      break
    }
    if (page === 10) {
      partial = true
    }
  }
  const since = new Date(Date.parse(now) - 90 * 86400000).toISOString()
  const snapshot: ActivitySnapshot = { fetchedAt: now, repos: [], items: [], calendar: [], coverage: 'rest90', partial }
  // Bounded work protects the unauthenticated rate limit; omitted data is labelled
  // as a sample, never as a complete count of the user's GitHub contributions.
  const mapped = new Set(Object.values(projectRepos))
  const selected = [...repos].sort((a, b) => Number(mapped.has(b.full_name)) - Number(mapped.has(a.full_name))).slice(0, 40)
  snapshot.partial ||= selected.length < repos.length || (!withCalendar && selected.length > 6)
  const recent = new Set(selected.slice(0, withCalendar ? 40 : 6).map((repo) => repo.full_name))
  let visibilityFailures = 0
  for (let index = 0; index < selected.length; index += 3) {
    await Promise.all(selected.slice(index, index + 3).map(async (listed) => {
      try {
        const repo = await request(`/repos/${listed.full_name}`) as Repo
        if (repo.private !== false || repo.fork || repo.full_name !== listed.full_name) {
          return
        }
        const [languages, commits, pulls] = await Promise.allSettled([
          request(`/repos/${repo.full_name}/languages`),
          recent.has(repo.full_name) ? request(`/repos/${repo.full_name}/commits?author=${githubOwner}&since=${since}&per_page=100`) : Promise.resolve([]),
          recent.has(repo.full_name) ? request(`/repos/${repo.full_name}/pulls?state=all&sort=created&direction=desc&per_page=100`) : Promise.resolve([]),
        ])
        snapshot.repos.push({ name: repo.full_name, project: Object.keys(projectRepos).find((key) => projectRepos[key] === repo.full_name), url: `https://github.com/${repo.full_name}`, languages: languages.status === 'fulfilled' ? languages.value as Record<string, number> : {} })
        if ([languages, commits, pulls].some((result) => result.status === 'rejected')) {
          snapshot.partial = true
        }
        if (commits.status === 'fulfilled') {
          const rows = commits.value as Commit[]
          snapshot.partial ||= rows.length === 100
          snapshot.items.push(...rows.map((commit) => ({ id: `${repo.full_name}:${commit.sha}`, kind: 'commit' as const, repo: repo.full_name, title: commit.commit.message.split('\n')[0]!, date: commit.commit.author.date, url: `https://github.com/${repo.full_name}/commit/${commit.sha}` })))
        }
        if (pulls.status === 'fulfilled') {
          const rows = pulls.value as Pull[]
          snapshot.partial ||= rows.length === 100
          snapshot.items.push(...rows.filter((pr) => pr.user.login === githubOwner && pr.created_at >= since).map((pr) => ({ id: `${repo.full_name}:pr:${pr.number}`, kind: 'pr' as const, repo: repo.full_name, title: pr.title, date: pr.created_at, url: `https://github.com/${repo.full_name}/pull/${pr.number}` })))
        }
      } catch {
        visibilityFailures++
        snapshot.partial = true
      }
    }))
  }
  if (selected.length > 0 && visibilityFailures === selected.length) {
    throw new Error('Public activity unavailable')
  }
  const allowed = new Set(snapshot.repos.map((repo) => repo.name))
  try {
    const events = await request(`/users/${githubOwner}/events/public?per_page=100`) as PublicEvent[]
    for (const event of events) {
      const release = event.payload?.release
      if (event.public && event.type === 'ReleaseEvent' && allowed.has(event.repo.name) && release) {
        snapshot.items.push({ id: event.id, kind: 'release', repo: event.repo.name, title: release.name || release.tag_name, date: event.created_at, url: `https://github.com/${event.repo.name}/releases/tag/${encodeURIComponent(release.tag_name)}` })
      }
    }
  } catch {
    snapshot.partial = true
  }
  snapshot.items = [...new Map(snapshot.items.filter((item) => item.date >= since && item.date <= now).map((item) => [item.id, item])).values()].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id))
  snapshot.repos.sort((a, b) => a.name.localeCompare(b.name))
  snapshot.calendar = calendarDays(snapshot.items, now, 90)
  if (withCalendar) {
    try {
      const year = `${new Date(Date.parse(now) - 364 * 86400000).toISOString().slice(0, 10)}T00:00:00Z`
      const result = await request('/graphql', { query: `query { user(login: "${githubOwner}") { contributionsCollection(from: "${year}", to: "${now}") { commitContributionsByRepository(maxRepositories: 100) { repository { nameWithOwner isPrivate isFork } contributions(first: 100) { nodes { occurredAt commitCount } pageInfo { hasNextPage } } } pullRequestContributions(first: 100) { nodes { occurredAt pullRequest { repository { nameWithOwner isPrivate isFork } } } pageInfo { hasNextPage } } } } }` }) as CalendarResponse
      if (result.errors || !result.data?.user) {
        throw new Error('Calendar unavailable')
      }
      const collection = result.data.user.contributionsCollection
      const days = calendarDays([], now, 365)
      const add = (date: string, count: number) => {
        const day = days.find((day) => day.date === date.slice(0, 10))
        if (day) {
          day.count += count
        }
      }
      for (const group of collection.commitContributionsByRepository) {
        if (!publicCalendarRepo(group.repository, allowed)) {
          continue
        }
        for (const item of group.contributions.nodes) {
          add(item.occurredAt, item.commitCount)
        }
        snapshot.partial ||= group.contributions.pageInfo.hasNextPage
      }
      for (const item of collection.pullRequestContributions.nodes) {
        if (publicCalendarRepo(item.pullRequest.repository, allowed)) {
          add(item.occurredAt, 1)
        }
      }
      snapshot.partial ||= collection.pullRequestContributions.pageInfo.hasNextPage
      snapshot.calendar = days
      snapshot.coverage = 'publicYear'
    } catch {
      snapshot.partial = true
    }
  }
  return snapshot
}
interface CalendarRepo { nameWithOwner: string, isPrivate: boolean, isFork: boolean }
function publicCalendarRepo(repo: CalendarRepo, allowed: Set<string>) {
  return repo.isPrivate === false && !repo.isFork && allowed.has(repo.nameWithOwner)
}
interface CalendarResponse {
  errors?: unknown[]
  data?: { user: { contributionsCollection: {
    commitContributionsByRepository: { repository: CalendarRepo, contributions: { nodes: { occurredAt: string, commitCount: number }[], pageInfo: { hasNextPage: boolean } } }[]
    pullRequestContributions: { nodes: { occurredAt: string, pullRequest: { repository: CalendarRepo } }[], pageInfo: { hasNextPage: boolean } }
  } } }
}
