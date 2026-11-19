import { createAvatar } from '@nextorders/avatar'
import { defineEventHandler, getQuery, getRouterParam, setResponseHeader } from 'h3'

const EMOTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const CLOTHING = ['amber', 'green', 'blue', 'teal', 'pink', 'violet']
export default defineEventHandler((event) => {
  const seed = getRouterParam(event, 'seed') || 'default'
  const query = getQuery(event)
  const gender = query.gender === 'female' ? 'female' : 'male'
  const emotion = EMOTIONS.includes(Number(query.emotion)) ? Number(query.emotion) : 5
  const clothing = CLOTHING.includes(query.clothing) ? query.clothing : 'blue'
  const svg = createAvatar({ seed, gender, emotion, clothing })
  setResponseHeader(event, 'Content-Type', 'image/svg+xml')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return svg
})
