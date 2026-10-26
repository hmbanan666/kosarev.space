import { spawn } from 'node:child_process'
import { join } from 'node:path'
import process from 'node:process'
import { chromium } from '@playwright/test'

const OUTPUT_DIR = '.output/public'
const PDF_PAGES = [
  { url: '/cv/print', publicPath: '/cv', locale: 'ru', file: 'cv.pdf' },
  { url: '/en/cv/print', publicPath: '/en/cv', locale: 'en', file: 'cv-en.pdf' },
]
const port = 10000 + Math.floor(Math.random() * 50000)
const origin = `http://127.0.0.1:${port}`

async function waitForServer(timeoutMs = 60000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${origin}/cv/print`)
      if (response.ok) {
        return
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`CV server did not start within ${timeoutMs / 1000}s`)
}

async function main() {
  console.log('[generate-cv-pdf] Generating CV PDFs...')
  const server = spawn('node', ['.output/server/index.mjs'], {
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), NODE_ENV: 'production' },
    stdio: 'ignore',
  })
  let browser
  try {
    await waitForServer()
    browser = await chromium.launch()
    for (const { url, publicPath, locale, file } of PDF_PAGES) {
      const page = await browser.newPage()
      await page.emulateMedia({ media: 'print', colorScheme: 'light', reducedMotion: 'reduce' })
      const response = await page.goto(`${origin}${url}`, { waitUntil: 'networkidle' })
      if (!response?.ok()) {
        throw new Error(`CV print route returned ${response?.status()}: ${url}`)
      }
      await page.locator(`[data-cv-ready="${locale}"]`).waitFor()
      await page.evaluate(async () => {
        await document.fonts.ready
        const text = document.querySelector('[data-cv-document]')?.textContent ?? ''
        for (const font of ['400 12px "Noto Sans"', '600 12px "Noto Sans"', '500 12px "Lora"']) {
          const faces = await document.fonts.load(font, text)
          if (!faces.length || faces.some((face) => face.status !== 'loaded')) {
            throw new Error(`Required CV font did not load: ${font}`)
          }
        }
        await Promise.all([...document.images].map((image) => image.decode()))
      })
      await page.pdf({
        path: join(OUTPUT_DIR, file),
        format: 'A4',
        preferCSSPageSize: true,
        printBackground: true,
        tagged: true,
        outline: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `<div style="width:100%;padding:0 14mm;font-family:Arial,sans-serif;font-size:8px;color:#52525b;display:flex;justify-content:space-between"><span>kosarev.space${publicPath}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
      })
      await page.close()
      console.log(`[generate-cv-pdf] Generated ${file}`)
    }
  } finally {
    try {
      await browser?.close()
    } finally {
      server.kill()
    }
  }
}

await main()
