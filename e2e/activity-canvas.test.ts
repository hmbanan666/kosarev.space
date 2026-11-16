import process from 'node:process'
import { expect, test } from '@playwright/test'
import snapshot from '../apps/web-app/tests/fixtures/activity-snapshot.json' with { type: 'json' }

test.beforeEach(async ({ page }) => {
  await page.route('**/api/activity', (route) => route.fulfill({ json: snapshot }))
})
for (const locale of ['ru', 'en']) {
  for (const width of [1280, 1440, 1920, 390]) {
    test(`activity cards and sheet at ${width}px (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : width === 1920 ? 1080 : 800 })
      await page.context().addCookies([{ name: 'i18n_redirected', value: locale, url: 'http://localhost:3333' }])
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('console', (message) => {
        if (/hydration/i.test(message.text())) {
          errors.push(message.text())
        }
      })
      await page.goto(locale === 'en' ? '/en' : '/')
      await page.locator('[data-block="hero"] .canvas-open').waitFor({ state: 'attached' })
      await expect(page.locator('[data-block="feed"] .activity-feed li')).toHaveCount(3)
      await page.evaluate(() => document.fonts.ready)
      await page.mouse.move(0, 0)
      await page.addStyleTag({ content: 'nuxt-devtools-frame {display:none!important}' })
      expect(await page.locator('[data-block]').evaluateAll((blocks) => blocks.filter((block) => block.scrollHeight > block.clientHeight + 2 || block.scrollWidth > block.clientWidth + 2).map((block) => block.getAttribute('data-block')))).toEqual([])
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
      if (width >= 768) {
        expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(width === 1920 ? 1080 : 800)
      }
      if (process.env.CANVAS_SCREENSHOTS) {
        await page.screenshot({ path: `docs/images/activity-canvas/after-${locale}-${width}.png`, fullPage: true, animations: 'disabled' })
      }
      const card = page.locator('[data-block="context"]')
      await card.locator('.canvas-description').click()
      await expect(page).toHaveURL(/\?card=context$/)
      const panel = page.getByRole('dialog')
      await expect(panel).toBeVisible()
      await expect(panel.locator('h2').first()).toHaveText('Context')
      await expect(panel.locator('.activity-feed li').first()).toBeVisible()
      const box = await panel.boundingBox()
      if (width === 390) {
        expect(box!.y).toBeGreaterThan(0)
      } else {
        expect(box!.x).toBeGreaterThan(width / 2 - 1)
      }
      if (process.env.CANVAS_SCREENSHOTS && (width === 1280 || width === 390)) {
        await page.screenshot({ path: `docs/images/activity-canvas/panel-${locale}-${width}.png`, animations: 'disabled' })
      }
      await page.keyboard.press('Shift+Tab')
      expect(await panel.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true)
      await page.keyboard.press('Tab')
      expect(await panel.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true)
      await page.keyboard.press('Escape')
      await expect(panel).not.toBeVisible()
      await expect(card.locator('.canvas-open')).toBeFocused()
      await page.goForward()
      await expect(panel).toBeVisible()
      await page.goBack()
      await expect(panel).not.toBeVisible()
      expect(errors).toEqual([])
    })
  }
}

test('deep links, outside dismissal, inner links and drag gestures remain distinct', async ({ page }) => {
  await page.goto('/en?card=context')
  const panel = page.getByRole('dialog')
  await expect(panel).toBeVisible()
  await page.mouse.click(10, 100)
  await expect(panel).not.toBeVisible()
  await expect(page).not.toHaveURL(/card=/)
  const card = page.locator('[data-block="context"]')
  const grip = card.locator('.canvas-grip')
  const box = await grip.boundingBox()
  await page.mouse.move(box!.x + 12, box!.y + 12)
  await page.mouse.down()
  await page.mouse.move(box!.x + 12, box!.y + 100, { steps: 5 })
  await page.mouse.up()
  await expect(panel).not.toBeVisible()
  await card.locator('h2 a').click()
  await expect(page).toHaveURL(/\/en\/projects\/context$/)
})
