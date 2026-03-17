import { spawn } from 'node:child_process'
import { join } from 'node:path'
import process from 'node:process'
import { chromium } from '@playwright/test'

const OUTPUT_DIR = '.output/public'

const PDF_PAGES = [
  { url: '/cv/print', file: 'cv.pdf' },
  { url: '/en/cv/print', file: 'cv-en.pdf' },
]

const PDF_OPTIONS = {
  format: 'A4',
  margin: { top: '8mm', bottom: '8mm', left: '10mm', right: '10mm' },
  printBackground: true,
}

const port = 10000 + Math.floor(Math.random() * 50000)

async function waitForServer(timeoutMs = 60000) {
  const start = Date.now()
  const url = `http://localhost:${port}/`

  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) {
        return
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }

  throw new Error(`Server did not start within ${timeoutMs / 1000}s`)
}

async function main() {
  console.log('[generate-cv-pdf] Generating CV PDFs...')

  const server = spawn('node', ['.output/server/index.mjs'], {
    env: { ...process.env, PORT: String(port), NODE_ENV: 'production' },
    stdio: 'ignore',
  })

  await waitForServer()

  try {
    const browser = await chromium.launch()

    for (const { url, file } of PDF_PAGES) {
      const page = await browser.newPage()
      await page.goto(`http://localhost:${port}${url}`, { waitUntil: 'networkidle' })
      await page.pdf({ path: join(OUTPUT_DIR, file), ...PDF_OPTIONS })
      await page.close()
      console.log(`[generate-cv-pdf] ✓ ${file}`)
    }

    await browser.close()
  } finally {
    server.kill()
  }
}

await main()
