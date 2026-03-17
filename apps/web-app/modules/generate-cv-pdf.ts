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

const PORT = 4173

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

    nuxt.hook('close', async () => {
      const { join } = await import('node:path')
      const { copyFileSync } = await import('node:fs')
      const process = await import('node:process').then((m) => m.default)
      const { spawn } = await import('node:child_process')
      const { chromium } = await import('@playwright/test')

      logger.info('Generating CV PDFs...')

      const server = spawn('node', ['.output/server/index.mjs'], {
        env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production' },
        stdio: 'pipe',
      })

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Server start timeout')), 15000)
        server.stdout?.on('data', (chunk) => {
          if (chunk.toString().includes('Listening')) {
            clearTimeout(timeout)
            resolve()
          }
        })
        server.on('error', reject)
      })

      try {
        const browser = await chromium.launch()

        for (const { url, file } of PDF_PAGES) {
          const publicPath = join('public', file)
          const outputPath = join('.output/public', file)

          const page = await browser.newPage()
          await page.goto(`http://localhost:${PORT}${url}`, { waitUntil: 'networkidle' })
          await page.pdf({ path: publicPath, ...PDF_OPTIONS })
          copyFileSync(publicPath, outputPath)
          logger.success(file)
          await page.close()
        }

        await browser.close()
      } finally {
        server.kill()
      }
    })
  },
})
