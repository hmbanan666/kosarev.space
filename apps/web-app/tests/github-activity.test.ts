import { expect, it } from 'vitest'
import { fetchPublicActivity } from '../server/utils/github-activity'
import commits from './fixtures/github-commits.json'
import repo from './fixtures/github-repo.json'

it('filters private repositories and forks before requesting or returning their content', async () => {
  const paths: string[] = []
  const result = await fetchPublicActivity(async (path: string) => {
    paths.push(path)
    if (path.includes('/events/')) {
      return []
    }
    if (path.startsWith('/users/')) {
      return [repo, { ...repo, full_name: 'hmbanan666/secret', private: true }, { ...repo, full_name: 'hmbanan666/fork', fork: true }]
    }
    if (path.includes('/commits')) {
      return commits
    }
    if (path.endsWith('/languages')) {
      return { TypeScript: 500, Vue: 200 }
    }
    if (path.includes('/pulls')) {
      return []
    }
    return repo
  }, '2026-11-16T12:00:00Z')
  expect(result.repos.map((repo) => repo.name)).toEqual(['hmbanan666/kosarev.space'])
  expect(result.items).toHaveLength(3)
  expect(JSON.stringify(result)).not.toMatch(/secret|\/fork/)
  expect(paths.join()).not.toMatch(/secret|\/fork/)
  expect(result.repos[0]?.languages).toEqual({ TypeScript: 500, Vue: 200 })
})

it('drops a repository that became private since the public listing', async () => {
  const result = await fetchPublicActivity(async (path) => {
    if (path.includes('/events/')) {
      return []
    }
    if (path.startsWith('/users/')) {
      return [repo]
    }
    return { ...repo, private: true }
  }, '2026-11-16T12:00:00Z')
  expect(result.repos).toEqual([])
  expect(result.items).toEqual([])
})

it('retains honest partial results when GitHub rate limits a repository', async () => {
  const result = await fetchPublicActivity(async (path) => {
    if (path.includes('/events/')) {
      return []
    }
    if (path.startsWith('/users/')) {
      return [repo]
    }
    if (path.endsWith('/kosarev.space')) {
      return repo
    }
    throw new Error('rate limited')
  }, '2026-11-16T12:00:00Z')
  expect(result.partial).toBe(true)
  expect(result.items).toEqual([])
})

it('uses the profile calendar including anonymous counts without repository details', async () => {
  const result = await fetchPublicActivity(async (path, body) => {
    if (path.includes('/events/')) {
      return []
    }
    if (path.startsWith('/users/')) {
      return [repo]
    }
    if (path === '/graphql') {
      expect(body?.query).toContain('from: "2025-11-17T00:00:00Z"')
      expect(body?.query).not.toMatch(/repository|first:/)

      return { data: { user: { contributionsCollection: {
        contributionCalendar: { totalContributions: 1002, weeks: [{ contributionDays: [
          { date: '2026-01-15', contributionCount: 1002 },
        ] }] },
      } } } }
    }
    if (path.includes('/commits')) {
      return commits
    }
    if (path.includes('/pulls')) {
      return []
    }
    if (path.endsWith('/languages')) {
      return { TypeScript: 500 }
    }
    return repo
  }, '2026-11-16T12:00:00Z', true)
  expect(result.coverage).toBe('githubYear')
  expect(result.calendarTotal).toBe(1002)
  expect(result.calendar).toHaveLength(365)
  expect(result.calendar[0]?.date).toBe('2025-11-17')
  expect(result.calendar.at(-1)?.date).toBe('2026-11-16')
  expect(result.items).toHaveLength(3)
  expect(result.items.every((item) => item.repo === repo.full_name)).toBe(true)
  expect(result.calendar.find((day) => day.date === '2026-01-15')?.count).toBe(1002)
  expect(JSON.stringify(result)).not.toMatch(/secret|unverified/)
})

it('fails refresh when every repository visibility request fails, preserving the stale cache', async () => {
  await expect(fetchPublicActivity(async (path) => {
    if (path.startsWith('/users/')) {
      return [repo]
    }
    throw new Error('unavailable')
  }, '2026-11-16T12:00:00Z')).rejects.toThrow('Public activity unavailable')
})

it('keeps the 90-day public calendar when the profile calendar fails', async () => {
  const result = await fetchPublicActivity(async (path) => {
    if (path === '/graphql') {
      return { errors: [{ message: 'unavailable' }] }
    }
    if (path.includes('/events/') || path.includes('/pulls')) {
      return []
    }
    if (path.startsWith('/users/')) {
      return [repo]
    }
    if (path.includes('/commits')) {
      return commits
    }
    if (path.endsWith('/languages')) {
      return { TypeScript: 500 }
    }
    return repo
  }, '2026-11-16T12:00:00Z', true)
  expect(result.coverage).toBe('rest90')
  expect(result.calendar).toHaveLength(90)
  expect(result.calendarTotal).toBeUndefined()
  expect(result.items).toHaveLength(3)
})
