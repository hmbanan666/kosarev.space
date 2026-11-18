import process from 'node:process'
import { expect, test } from '@playwright/test'

const sizes = [1024, 1280, 1440, 1920, 390]

for (const locale of ['en', 'ru']) {
  for (const width of sizes) {
    test.describe(`${width}px (${locale})`, () => {
      test.use({ hasTouch: width === 390, isMobile: width === 390 })
      test(`shared horizontal grid and aligned initial canvas at ${width}px (${locale})`, async ({ page }) => {
        await page.setViewportSize({ width, height: width === 390 ? 844 : width === 1920 ? 1080 : 800 })
        const errors: string[] = []
        page.on('pageerror', (error) => errors.push(error.message))
        page.on('console', (message) => {
          if (/hydration/i.test(message.text())) {
            errors.push(message.text())
          }
        })
        await page.goto('/en')
        await expect(page.locator('.contact-email-row button')).toBeEnabled()
        if (locale === 'ru') {
          await page.getByRole('link', { name: 'Русский', exact: true }).click()
        }
        await expect(page.locator('html')).toHaveAttribute('lang', locale)
        if (width >= 768) {
          await expect(page.locator('.home-canvas')).toHaveClass(/canvas-enabled/)
          await expect(page.locator('[data-live-cursors-bar]')).toBeVisible()
        }
        await page.evaluate(() => document.fonts.ready)
        await page.mouse.move(0, 0)
        // Measure the fitted cells after layout, independent of card travel during resize.
        await page.addStyleTag({ content: '#nuxt-devtools-container { display: none !important; } .canvas-enabled .blueprint-frame { transition: none; }' })
        // Opt-in, reviewable evidence on the same browser path as the assertions.
        if (process.env.CANVAS_SCREENSHOTS) {
          await page.evaluate(() => Promise.all([...document.images].filter((img) => img.complete).map((img) => img.decode().catch(() => {}))))
          await page.screenshot({ path: `docs/images/canvas-fullscreen/${process.env.CANVAS_SCREENSHOTS}-${locale}-${width}.png`, fullPage: true, animations: 'disabled' })
        }
        const edges = await page.locator(width >= 768 ? '.site-header-inner, .canvas-tools' : '.site-header-inner, .canvas-viewport, .site-footer > .site-wrap').evaluateAll((elements) => elements.map((element) => {
          const rect = element.getBoundingClientRect()
          return { name: element.className, left: rect.left, right: rect.right }
        }))
        for (const edge of edges) {
          expect(Math.abs(edge.left - edges[0]!.left), `${edge.name} left`).toBeLessThan(1)
          expect(Math.abs(edge.right - edges[0]!.right), `${edge.name} right`).toBeLessThan(1)
          expect(Math.abs(edge.left - (width - edge.right)), `${edge.name} equal gutters`).toBeLessThan(1)
        }
        if (width === 390) {
          const header = await page.locator('.site-header').boundingBox()
          const firstCard = await page.locator('[data-block="hero"]').boundingBox()
          expect(firstCard!.y - (header!.y + header!.height)).toBe(16)
        }
        if (width >= 768) {
          const margins = await page.locator('.canvas-viewport').evaluate((viewport) => {
            const frame = viewport.getBoundingClientRect()
            const board = viewport.querySelector('[data-canvas-world]')!.getBoundingClientRect()
            return [board.left - frame.left, frame.right - board.right, board.top - frame.top, frame.bottom - board.bottom]
          })
          expect(margins[0]).toBeCloseTo(margins[2]!, 0)
          expect(margins[0]).toBeGreaterThan(0)
          expect(margins[1]).toBeLessThan(0)
          expect(margins[3]).toBeLessThan(0)
          expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(width === 1920 ? 1080 : 800)
          const grid = await page.locator('[data-canvas-world]').evaluate((world) => {
            const scale = world.getBoundingClientRect().width / (world as HTMLElement).offsetWidth
            const blocks = [...world.querySelectorAll<HTMLElement>('[data-block]')]
            const rects = blocks.map((block) => block.getBoundingClientRect())
            const gaps: number[] = []
            for (const a of rects) {
              const right = rects.filter((b) => b.left > a.right && b.top < a.bottom && b.bottom > a.top).map((b) => b.left - a.right)
              const below = rects.filter((b) => b.top > a.bottom && b.left < a.right && b.right > a.left).map((b) => b.top - a.bottom)
              if (right.length) {
                gaps.push(Math.min(...right) / scale)
              }
              if (below.length) {
                gaps.push(Math.min(...below) / scale)
              }
            }
            return {
              gaps,
              padding: blocks.map((block) => getComputedStyle(block).padding),
              linkInsets: blocks.flatMap((block) => {
                const link = block.querySelector('.canvas-source, .canvas-links')
                return link ? [(block.getBoundingClientRect().bottom - link.getBoundingClientRect().bottom) / scale] : []
              }),
            }
          })
          for (const gap of grid.gaps) {
            expect(gap).toBeGreaterThanOrEqual(15.9)
          }
          expect(new Set(grid.padding)).toEqual(new Set(['24px']))
          for (const inset of grid.linkInsets) {
            expect(inset).toBeCloseTo(25, 1)
          }
          const controls = await page.locator('.canvas-tools').evaluate((tools) => {
            const bar = tools.querySelector('[data-live-cursors-bar]')!.getBoundingClientRect()
            const left = tools.querySelector('.canvas-copyright')!.getBoundingClientRect()
            const right = tools.querySelector('.canvas-credits')!.getBoundingClientRect()
            const frame = tools.getBoundingClientRect()
            return { center: bar.left + bar.width / 2, middle: bar.top + bar.height / 2, frameMiddle: frame.top + frame.height / 2, leftHeight: left.height, rightHeight: right.height, leftWidth: left.width, rightWidth: right.width }
          })
          expect(Math.abs(controls.center - width / 2)).toBeLessThan(1)
          expect(Math.abs(controls.middle - controls.frameMiddle)).toBeLessThan(1)
          expect(controls.leftHeight).toBeLessThanOrEqual(44)
          expect(controls.rightHeight).toBeLessThanOrEqual(44)
          const face = page.locator('[data-live-cursors-bar] img').first()
          await expect(face).toBeVisible()
          await expect.poll(async () => (await face.boundingBox())?.width).toBe(24)
          await expect(page.locator('[data-live-cursors-bar]')).toHaveCSS('border-radius', '9999px')
        }
        expect(await page.locator('[data-block]').evaluateAll((blocks) => blocks.filter((block) => block.scrollHeight > block.clientHeight + 2 || block.scrollWidth > block.clientWidth + 2).map((block) => block.getAttribute('data-block')))).toEqual([])
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
        expect(errors).toEqual([])
      })
    })
  }
}

for (const locale of ['en', 'ru']) {
  for (const width of sizes) {
    test.describe(`${width}px (${locale})`, () => {
      test.use({ hasTouch: width === 390, isMobile: width === 390 })
      test(`shared chrome on project and reading pages at ${width}px (${locale})`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 })
        await page.context().addCookies([{ name: 'i18n_redirected', value: locale, url: 'http://localhost:3333' }])
        for (const path of ['/projects/context', '/writing']) {
          await page.goto(`${locale === 'en' ? '/en' : ''}${path}`)
          await expect(page.locator('html')).toHaveAttribute('lang', locale)
          const boxes = await page.locator('.site-header-inner, main > .site-wrap, .site-footer > .site-wrap').evaluateAll((elements) => elements.map((element) => {
            const rect = element.getBoundingClientRect()
            return { left: rect.left, right: rect.right }
          }))
          expect(boxes).toHaveLength(3)
          expect(new Set(boxes.map((box) => box.left)).size).toBe(1)
          expect(new Set(boxes.map((box) => box.right)).size).toBe(1)
          expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
          await page.locator('.site-footer').scrollIntoViewIfNeeded()
          await expect(page.locator('.site-footer a[href="mailto:nick@kosarev.space"]')).toBeVisible()
        }
      })
    })
  }
}
