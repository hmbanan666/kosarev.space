import { writingFeed } from '../../../utils/writing-feed'

export default defineEventHandler(async (event) => {
  try {
    const xml = await writingFeed('en')
    setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
    setHeader(event, 'Cache-Control', 'no-store')
    return xml
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Feed unavailable' })
  }
})
