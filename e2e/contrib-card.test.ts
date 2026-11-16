import { mkdir } from 'node:fs/promises'
import process from 'node:process'
import { expect, test } from '@playwright/test'
import en from '../apps/web-app/i18n/locales/en.json' with { type: 'json' }
import ru from '../apps/web-app/i18n/locales/ru.json' with { type: 'json' }
import snapshot from '../apps/web-app/tests/fixtures/activity-snapshot.json' with { type: 'json' }

for (const locale of ['ru', 'en']) {
  for (const width of [1440, 390]) {
    test.describe(`${locale} ${width}`, () => {
      test.use({ hasTouch: width === 390, isMobile: width === 390 })
      test('contribution details, day feedback and shareable panel', async ({ page }) => {
        const copy = locale === 'en' ? en : ru
        await page.setViewportSize({ width, height: 900 })
        await page.context().addCookies([{ name: 'i18n_redirected', value: locale, url: 'http://localhost:3333' }])
        await page.route('**/api/activity', (route) => route.fulfill({ json: snapshot }))
        await page.goto(locale === 'en' ? '/en?view=home' : '/?view=home')
        const card = page.locator('[data-block="contributions"]')
        await expect(card.locator('.activity-graph span')).toHaveCount(width === 390 ? 177 : 365)
        await page.evaluate(() => document.fonts.ready)
        await page.addStyleTag({ content: '#nuxt-devtools-container {display:none!important}' })
        if (process.env.CONTRIB_SCREENSHOTS) {
          await mkdir('docs/images/contrib-card', { recursive: true })
          if (width === 390) {
            await page.screenshot({ path: `docs/images/contrib-card/header-${locale}-${width}.png`, animations: 'disabled' })
          }
        }
        await card.locator('.canvas-open').focus()
        await expect(card.locator('h2')).toHaveText(locale === 'ru' ? 'Работа в коде за год' : 'Code activity this year')
        await expect(card.locator('.activity-legend')).toHaveAccessibleName(copy.activity.legend)
        await expect(card.locator('.activity-calendar-stats')).toHaveText(`${copy.activity.activeDays}: 192`)
        expect(await card.evaluate((el) => el.scrollHeight <= el.clientHeight + 2 && el.scrollWidth <= el.clientWidth + 2)).toBe(true)
        const days = card.locator('.activity-graph span')
        const first = days.first()
        const tip = page.getByRole('tooltip')
        await expect(first).toHaveCSS('cursor', 'help')
        if (width === 390) {
          const box = await first.boundingBox()
          const touch = await page.context().newCDPSession(page)
          await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 }] })
          await expect(tip).toHaveText((await first.getAttribute('aria-label'))!)
          await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
        } else {
          await first.hover()
        }
        await expect(tip).toHaveText((await first.getAttribute('aria-label'))!)
        await expect(page.getByRole('dialog')).not.toBeVisible()
        await first.focus()
        await page.keyboard.press('ArrowRight')
        await expect(days.nth(7)).toBeFocused()
        await expect(tip).toHaveText((await days.nth(7).getAttribute('aria-label'))!)
        await page.keyboard.press('Escape')
        await expect(tip).not.toBeVisible()
        await card.locator('.canvas-open').focus()
        await page.mouse.move(0, 0)
        if (process.env.CONTRIB_SCREENSHOTS) {
          await page.screenshot({ path: `docs/images/contrib-card/card-${locale}-${width}.png`, animations: 'disabled' })
        }
        // The legend is part of the clickable card surface.
        await card.locator('.activity-legend').click()
        const panel = page.getByRole('dialog')
        await expect(panel).toBeVisible()
        await expect(page).toHaveURL(/view=home&card=contributions$/)
        await expect(panel.getByRole('heading', { name: copy.activity.contributions, exact: true })).toHaveCount(1)
        await expect(panel.locator('.activity-graph')).toHaveCount(0)
        const profile = panel.getByRole('link', { name: copy.activity.githubProfile })
        await expect(profile).toHaveAttribute('href', 'https://github.com/hmbanan666')
        await expect(profile).toHaveAttribute('target', '_blank')
        await expect(profile).toHaveAttribute('rel', 'noopener noreferrer')
        await expect(profile).toBeInViewport()
        await expect(panel.locator('.contribution-months li')).toHaveCount(13)
        await expect(panel.locator('.contribution-stats dd').nth(0)).toHaveText((1305).toLocaleString(locale))
        await expect(panel.locator('.contribution-stats dd').nth(1)).toHaveText('192')
        await expect(panel.locator('.contribution-months li').first()).toContainText('65')
        await expect(panel.locator('.activity-feed li')).toHaveCount(3)
        expect(await panel.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
        if (process.env.CONTRIB_SCREENSHOTS) {
          await page.screenshot({ path: `docs/images/contrib-card/panel-${locale}-${width}.png`, animations: 'disabled' })
          await panel.evaluate((element) => {
            element.scrollTop = element.scrollHeight
          })
          await page.screenshot({ path: `docs/images/contrib-card/panel-details-${locale}-${width}.png`, animations: 'disabled' })
        }
        await page.keyboard.press('Escape')
        await expect(panel).not.toBeVisible()
        await expect(page).toHaveURL(/\?view=home$/)
        await expect(card.locator('.canvas-open')).toBeFocused()
        await page.goForward()
        await expect(panel).toBeVisible()
        await page.reload()
        await expect(panel).toBeVisible()
        await panel.getByRole('button', { name: copy.activity.close }).click()
        await expect(page).toHaveURL(/\?view=home$/)
      })
    })
  }
}

test('unavailable calendar and empty public feed stay honest', async ({ page }) => {
  await page.route('**/api/activity', (route) => route.fulfill({ json: { ...snapshot, coverage: 'unavailable', calendar: [], calendarTotal: undefined, items: [] } }))
  await page.goto('/en?card=contributions')
  const panel = page.getByRole('dialog')
  await expect(panel).toBeVisible()
  await expect(panel.getByText(en.activity.unavailable, { exact: true })).toBeVisible()
  await expect(panel.getByText(en.activity.noActivity, { exact: true })).toBeVisible()
  await expect(panel.locator('.contribution-stats, .contribution-months')).toHaveCount(0)
  await expect(page.locator('[data-block="contributions"] .activity-calendar-stats')).toHaveCount(0)
})

test('the public fallback panel labels its range and incomplete sample', async ({ page }) => {
  await page.route('**/api/activity', (route) => route.fulfill({ json: { ...snapshot, coverage: 'rest90', calendar: snapshot.calendar.slice(-90), calendarTotal: undefined } }))
  await page.goto('/en?card=contributions')
  const panel = page.getByRole('dialog')
  await expect(panel).toBeVisible()
  await expect(panel.getByText(en.activity.rest90, { exact: false })).toBeVisible()
  await expect(panel.getByText(en.activity.partial, { exact: true })).toBeVisible()
  await expect(panel.locator('.contribution-months li')).toHaveCount(4)
})

test('a single active day has a one-day streak', async ({ page }) => {
  await page.route('**/api/activity', (route) => route.fulfill({ json: {
    ...snapshot, calendar: [{ date: '2026-11-16', count: 1 }], calendarTotal: 1,
  } }))
  await page.goto('/en?card=contributions')
  const panel = page.getByRole('dialog')
  await expect(panel.locator('.contribution-stats dd').nth(2)).toHaveText('1 day in a row')
})

test('empty canvas clears card text selection without clearing it on cards or controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/en?view=home')
  const card = page.locator('[data-block="contributions"]')
  await expect(card.locator('.canvas-open')).toBeVisible()
  const select = () => card.locator('h2').evaluate((element) => {
    const range = document.createRange()
    range.selectNodeContents(element)
    window.getSelection()!.removeAllRanges()
    window.getSelection()!.addRange(range)
  })
  await select()
  expect(await page.evaluate(() => window.getSelection()!.toString())).not.toBe('')
  // Synthetic pointerdown keeps the browser's native selection behavior out of this assertion.
  await card.dispatchEvent('pointerdown', { isPrimary: true, button: 0, pointerId: 1 })
  expect(await page.evaluate(() => window.getSelection()!.toString())).not.toBe('')
  await card.locator('.canvas-grip').dispatchEvent('pointerdown', { isPrimary: true, button: 0, pointerId: 1 })
  expect(await page.evaluate(() => window.getSelection()!.toString())).not.toBe('')
  await page.locator('.canvas-viewport').dispatchEvent('pointercancel')
  const empty = await page.locator('.canvas-viewport').evaluate((element) => {
    const box = element.getBoundingClientRect()
    for (let y = box.top + 20; y < box.bottom - 20; y += 20) {
      for (let x = box.left + 20; x < box.right - 20; x += 20) {
        const target = document.elementFromPoint(x, y)
        if (target && element.contains(target) && !target.closest('article, a, button, input, select, summary, [role="button"]')) {
          return { x, y }
        }
      }
    }
    throw new Error('No empty canvas point found')
  })
  await page.mouse.move(empty.x, empty.y)
  await page.mouse.down()
  expect(await page.evaluate(() => window.getSelection()!.rangeCount)).toBe(0)
  await page.mouse.up()
  await card.locator('.canvas-open').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
})
