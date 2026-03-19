import { createHash } from 'node:crypto'
import { CASE_ALLOWED_EMOJIS } from '@kosarev/database'

import { getRequestIP } from 'h3'

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  if (!key) {
    throw createError({ statusCode: 400, statusMessage: 'Missing case key' })
  }

  const body = await readBody<{ emoji?: string }>(event)

  if (body?.emoji && !CASE_ALLOWED_EMOJIS.includes(body.emoji)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid emoji' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16)

  if (body?.emoji) {
    await repository.case.setReaction(key, body.emoji, ipHash)
  } else {
    await repository.case.removeReaction(key, ipHash)
  }

  return { ok: true }
})
