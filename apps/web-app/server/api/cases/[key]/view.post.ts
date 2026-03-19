import { createHash } from 'node:crypto'
import { getRequestIP } from 'h3'

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  if (!key) {
    throw createError({ statusCode: 400, statusMessage: 'Missing case key' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16)

  await repository.case.addView(key, ipHash)

  return { ok: true }
})
