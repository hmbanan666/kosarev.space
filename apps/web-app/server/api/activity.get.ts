import type { ActivitySnapshot } from '../../shared/activity'
import { emptyActivity } from '../../shared/activity'
import { createActivityCache } from '../utils/activity-cache'
import { fetchPublicActivity } from '../utils/github-activity'

const languages = defineCachedFunction(async (path: string) => githubRequest(path), { name: 'public-languages-v1', maxAge: 86400, swr: false, getKey: (path) => path })
async function githubRequest(path: string, body?: { query: string }): Promise<unknown> {
  const token = useRuntimeConfig().githubToken
  const response = await fetch(`https://api.github.com${path}`, {
    method: body ? 'POST' : 'GET', body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(5000),
    headers: { 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'kosarev.space', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
  if (!response.ok) {
    throw new Error('Public activity unavailable')
  }
  return response.json()
}
const activity = createActivityCache({
  getItem: (key) => useStorage('cache').getItem<ActivitySnapshot>(key),
  setItem: (key, value) => useStorage('cache').setItem(key, value),
}, async () => {
  const token = useRuntimeConfig().githubToken
  return fetchPublicActivity((path, body) => path.endsWith('/languages') ? languages(path) : githubRequest(path, body), new Date().toISOString(), !!token)
})
export default defineEventHandler((event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  if (useRuntimeConfig().githubActivityDisabled) {
    return emptyActivity()
  }
  return activity((promise) => event.waitUntil(promise))
})
