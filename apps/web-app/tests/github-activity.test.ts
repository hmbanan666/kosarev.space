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

it('excludes private, fork and unverified contributions from a token-backed year', async () => {
  const result = await fetchPublicActivity(async (path) => {
    if (path.includes('/events/')) {
      return []
    }
    if (path.startsWith('/users/')) {
      return [repo]
    }
    if (path === '/graphql') {
      return { data: { user: { contributionsCollection: {
        commitContributionsByRepository: [
          { repository: { nameWithOwner: repo.full_name, isPrivate: false, isFork: false }, contributions: { nodes: [{ occurredAt: '2026-01-15T12:00:00Z', commitCount: 3 }], pageInfo: { hasNextPage: false } } },
          { repository: { nameWithOwner: 'hmbanan666/secret', isPrivate: true, isFork: false }, contributions: { nodes: [{ occurredAt: '2026-01-15T12:00:00Z', commitCount: 999 }], pageInfo: { hasNextPage: false } } },
        ],
        pullRequestContributions: { nodes: [{ occurredAt: '2026-01-15T12:00:00Z', pullRequest: { repository: { nameWithOwner: 'hmbanan666/unverified', isPrivate: false, isFork: false } } }], pageInfo: { hasNextPage: false } },
      } } } }
    }
    if (path.includes('/commits') || path.includes('/pulls')) {
      return []
    }
    if (path.endsWith('/languages')) {
      return { TypeScript: 500 }
    }
    return repo
  }, '2026-11-16T12:00:00Z', true)
  expect(result.coverage).toBe('publicYear')
  expect(result.calendar).toHaveLength(365)
  expect(result.calendar.find((day) => day.date === '2026-01-15')?.count).toBe(3)
  expect(JSON.stringify(result)).not.toMatch(/secret|unverified|999/)
})

it('fails refresh when every repository visibility request fails, preserving the stale cache', async () => {
  await expect(fetchPublicActivity(async (path) => {
    if (path.startsWith('/users/')) {
      return [repo]
    }
    throw new Error('unavailable')
  }, '2026-11-16T12:00:00Z')).rejects.toThrow('Public activity unavailable')
})
