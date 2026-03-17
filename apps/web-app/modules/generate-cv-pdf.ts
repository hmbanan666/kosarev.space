import { defineNuxtModule, useLogger } from 'nuxt/kit'

const logger = useLogger('generate-cv-pdf')

const PDF_PAGES = [
  { url: '/cv/print', file: 'cv.pdf' },
  { url: '/en/cv/print', file: 'cv-en.pdf' },
]

const PDF_OPTIONS = {
  format: 'A4' as const,
  margin: { top: '8mm', bottom: '8mm', left: '10mm', right: '10mm' },
  printBackground: true,
}

function getRandomPort() {
  return 10000 + Math.floor(Math.random() * 50000)
}

async function waitForServer(port: number, timeoutMs = 60000) {
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

export default defineNuxtModule({
  meta: {
    name: 'generate-cv-pdf',
    configKey: 'generateCvPdf',
  },

  defaults: {
    enabled: true,
  },

  async setup(options, nuxt) {
    if (nuxt.options.dev || !options.enabled) {
      return
    }

    nuxt.hook('build:done', async () => {
      const { join, resolve } = await import('node:path')
      const { existsSync, copyFileSync } = await import('node:fs')
      const process = await import('node:process').then((m) => m.default)
      const { spawn } = await import('node:child_process')
      const { chromium } = await import('@playwright/test')

      const port = getRandomPort()
      const outputDir = resolve(nuxt.options.buildDir, '../.output/public')

      logger.info('Generating CV PDFs...')

      const server = spawn('node', ['.output/server/index.mjs'], {
        env: { ...process.env, PORT: String(port), NODE_ENV: 'production' },
        stdio: 'ignore',
      })

      await waitForServer(port)

      try {
        const browser = await chromium.launch()

        for (const { url, file } of PDF_PAGES) {
          try {
            const page = await browser.newPage()
            await page.goto(`http://localhost:${port}${url}`, { waitUntil: 'networkidle' })

            // Save to public/ for future builds
            const publicPath = join('public', file)
            await page.pdf({ path: publicPath, ...PDF_OPTIONS })

            // Copy to build output if it exists
            if (existsSync(outputDir)) {
              copyFileSync(publicPath, join(outputDir, file))
            }

            await page.close()
            logger.success(file)
          } catch (err) {
            logger.error(`Failed to generate ${file}:`, err)
          }
        }

        await browser.close()
      } finally {
        server.kill()
      }
    })
  },
})
