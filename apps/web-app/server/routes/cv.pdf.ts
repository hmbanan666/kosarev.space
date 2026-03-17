import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler((event) => {
  const filePath = join('.output/public', 'cv.pdf')

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, message: 'CV PDF not found' })
  }

  setResponseHeaders(event, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'inline; filename="cv.pdf"',
  })

  return readFileSync(filePath)
})
