import process from 'node:process'
import { expect, test } from '@playwright/test'
import en from '../apps/web-app/i18n/locales/en.json' with { type: 'json' }
import ru from '../apps/web-app/i18n/locales/ru.json' with { type: 'json' }
import snapshot from '../apps/web-app/tests/fixtures/activity-snapshot.json' with { type: 'json' }

test.beforeEach(async ({ page }) => {
  await page.route('**/api/activity', (route) => route.fulfill({ json: snapshot }))
})
for (const locale of ['ru', 'en']) {
  for (const width of [1280, 1440, 1920, 390]) {
    test.describe(`${locale} at ${width}px`, () => {
      test.use({ hasTouch: width === 390, isMobile: width === 390 })
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
        if (width === 390) {
          await expect(page.locator('[data-live-cursors-bar]')).toHaveCount(0)
        }
        await page.evaluate(() => document.fonts.ready)
        await page.mouse.move(0, 0)
        await page.addStyleTag({ content: '#nuxt-devtools-container {display:none!important}' })
        expect(await page.locator('[data-block]').evaluateAll((blocks) => blocks.filter((block) => block.scrollHeight > block.clientHeight + 2 || block.scrollWidth > block.clientWidth + 2).map((block) => block.getAttribute('data-block')))).toEqual([])
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
        if (width >= 768) {
          expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(width === 1920 ? 1080 : 800)
        }
        const graph = page.locator('[data-block="contributions"] .activity-graph')
        await expect(graph.locator('span')).toHaveCount(width === 390 ? 177 : 365)
        expect(await graph.evaluate((el) => Number(getComputedStyle(el).getPropertyValue('--weeks')))).toBe(width === 390 ? 26 : 53)
        await expect(page.locator('[data-block="contributions"] .activity-year-total')).toBeVisible()
        const paragraph = page.locator('[data-block="hero"] .canvas-description')
        await expect(paragraph).toHaveText((locale === 'ru' ? ru : en).hero.description)
        expect(await paragraph.evaluate((el) => el.scrollHeight <= el.clientHeight + 1)).toBe(true)
        await expect(page.locator('.canvas-zoom')).toHaveCount(0)
        if (width === 390) {
          await expect(page.locator('[data-live-cursors-bar]')).toHaveCount(0)
        }
        if (process.env.CANVAS_SCREENSHOTS && (locale === 'ru' || width === 1440)) {
          await page.screenshot({ path: `docs/images/canvas-polish/after-${locale}-${width}.png`, fullPage: true, animations: 'disabled' })
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
        if (process.env.CANVAS_SCREENSHOTS && locale === 'ru' && width === 1280) {
          await page.screenshot({ path: `docs/images/canvas-polish/panel-${locale}-${width}.png`, animations: 'disabled' })
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

for (const changed of [false, true]) {
  test(`an activity response preserves an in-progress drag (${changed ? 'new ranking' : 'same ranking'})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.clock.install()
    await page.unroute('**/api/activity')
    let hold = false
    let release!: () => void
    let requested!: () => void
    const held = new Promise<void>((resolve) => {
      release = resolve
    })
    const intercepted = new Promise<void>((resolve) => {
      requested = resolve
    })
    await page.route('**/api/activity', async (route) => {
      if (hold) {
        requested()
        await held
      }
      await route.fulfill({ json: hold && changed ? snapshot : { ...snapshot, repos: [], items: [], calendar: [] } })
    })
    await page.goto('/en')
    await expect(page.locator('.home-canvas')).toHaveClass(/canvas-enabled/)
    await expect(page.locator('[data-block="contributions"] .canvas-eyebrow')).toContainText('Past year')
    hold = true
    await page.clock.fastForward(11000)
    await intercepted
    const block = page.locator('[data-block="context"]')
    const original = await block.getAttribute('style')
    const grip = await block.locator('.canvas-grip').boundingBox()
    await page.mouse.move(grip!.x + 12, grip!.y + 12)
    await page.mouse.down()
    await page.mouse.move(grip!.x + 12, grip!.y + 74, { steps: 6 })
    await expect(page.locator('.canvas-target')).toBeVisible()
    const refreshed = page.waitForResponse('**/api/activity')
    release()
    await refreshed
    if (changed) {
      await expect(page.locator('[data-block="feed"] .activity-feed li')).toHaveCount(3)
    }
    await page.clock.fastForward(100)
    await expect(page.locator('.canvas-target')).toBeVisible()
    await page.mouse.up()
    await expect(block).not.toHaveAttribute('style', original!)
    await expect(page.getByRole('dialog')).not.toBeVisible()
    const moved = await block.getAttribute('style')
    await page.reload()
    await expect(block).toHaveAttribute('style', moved!)
  })
}

test('presence follows navigation into the normal page footer', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.context().addCookies([{ name: 'i18n_redirected', value: 'ru', url: 'http://localhost:3333' }])
  await page.goto('/')
  await expect(page.locator('.canvas-presence [data-live-cursors-bar]')).toBeVisible()
  await page.locator('.site-desktop-nav a[href="/projects"]').click()
  const pill = page.locator('.site-footer [data-live-cursors-bar]')
  await expect(pill).toHaveCount(1)
  await expect(pill).not.toBeInViewport()
  await page.locator('.site-footer').scrollIntoViewIfNeeded()
  await expect(pill).toBeInViewport()
  await expect(pill).toHaveCSS('position', 'relative')
  await expect(pill).toHaveCSS('border-radius', '9999px')
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({ content: '#nuxt-devtools-container {display:none!important}' })
  if (process.env.CANVAS_SCREENSHOTS) {
    await page.screenshot({ path: 'docs/images/canvas-polish/projects-ru-1280.png', fullPage: true, animations: 'disabled' })
  }
  await page.locator('.site-brand').click()
  await expect(page.locator('.canvas-presence [data-live-cursors-bar]')).toBeVisible()
  await expect(page.locator('[data-live-cursors-bar]')).toHaveCount(1)
})

test('the 90-day public fallback fits without a year total', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.route('**/api/activity', (route) => route.fulfill({ json: { ...snapshot, coverage: 'rest90', calendar: snapshot.calendar.slice(-90), calendarTotal: undefined } }))
  await page.goto('/en')
  const card = page.locator('[data-block="contributions"]')
  await expect(card.locator('.canvas-eyebrow')).toContainText('Public sample')
  await expect(card.locator('.activity-graph span')).toHaveCount(90)
  await expect(card.locator('.activity-year-total')).toHaveCount(0)
  expect(await card.evaluate((el) => el.scrollHeight <= el.clientHeight + 2)).toBe(true)
})
