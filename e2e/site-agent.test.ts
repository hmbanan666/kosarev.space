import type { Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import process from 'node:process'
import { expect, test } from '@playwright/test'

async function openAgent(page: Page, label: string) {
  await page.locator('.site-agent').waitFor({ state: 'attached' })
  await page.locator('.site-header').getByRole('button', { name: label, exact: true }).click()
  await expect(page.getByRole('dialog', { name: label, exact: true })).toBeVisible()
}

for (const locale of ['ru', 'en']) {
  for (const width of [1280, 390]) {
    test(`${locale} ${width}: suggested question, answer, sources and session history`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.context().addCookies([{ name: 'i18n_redirected', value: locale, url: 'http://localhost:3333' }])
      const english = locale === 'en'
      const label = english ? 'AI Bot' : 'AI Бот'
      const prefix = english ? '/en' : ''
      const answer = english ? 'K39 is a map of places in Kaliningrad. Explore [K39](/en/projects/k39) or visit [k39.online](https://k39.online).' : 'K39. Карта мест Калининграда. Подробнее о [K39](/projects/k39) и на [k39.online](https://k39.online).'
      await page.route('**/api/agent', async (route) => {
        const body = route.request().postDataJSON()
        expect(body.messages.at(-1).role).toBe('user')
        expect(body.locale).toBe(locale)
        await route.fulfill({ contentType: 'text/event-stream', body: [
          { type: 'delta', text: answer.slice(0, 20) },
          { type: 'delta', text: answer.slice(20) },
          { type: 'sources', sources: [{ title: 'K39', url: `${prefix}/projects/k39` }] },
          { type: 'done' },
        ].map((event) => `data: ${JSON.stringify(event)}\n\n`).join('') })
      })
      await page.goto(`${prefix}/`)
      await page.locator('[data-block="hero"] .canvas-open').waitFor({ state: 'attached' })
      await page.evaluate(() => document.fonts.ready)
      await page.addStyleTag({ content: 'nuxt-devtools-frame {display:none!important}' })
      await openAgent(page, label)
      const dialog = page.getByRole('dialog')
      await expect(dialog.locator('.agent-hint'))[width === 390 ? 'toBeHidden' : 'toBeVisible']()
      await expect(dialog).toHaveClass(/site-drawer/)
      await expect(dialog.locator('.site-drawer-heading h2')).toHaveText(label)
      await expect(dialog.locator('.agent-privacy')).toHaveCount(0)
      await expect(dialog).toHaveClass(/ym-hide-content/)
      await expect(dialog.locator('textarea')).toHaveClass(/ym-disable-keys/)
      await expect(dialog.locator('form')).toHaveClass(/ym-disable-submit/)
      await expect(dialog.locator('.agent-suggestions button')).toHaveCount(5)
      await expect(page.locator('#site-agent-input')).toBeFocused()
      if (process.env.AGENT_SCREENSHOTS) {
        await mkdir('docs/images/site-agent', { recursive: true })
        await page.screenshot({ path: `docs/images/site-agent/empty-${locale}-${width}.png` })
      }
      await dialog.locator('.agent-suggestions button').first().click()
      await expect(dialog.locator('.agent-markdown')).toContainText('K39')
      await expect(dialog.getByRole('link', { name: 'k39.online' })).toHaveAttribute('href', 'https://k39.online')
      await expect(dialog.getByRole('link', { name: 'k39.online' })).toHaveClass(/ym-disable-tracklink/)
      await expect(dialog.locator('.agent-user')).toHaveCSS('align-self', 'flex-end')
      await expect(dialog.locator('.agent-role')).toHaveClass([/sr-only/, /sr-only/])
      expect(await dialog.locator('.agent-scroll').evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
      await dialog.locator('.agent-sources summary').click()
      if (process.env.AGENT_SCREENSHOTS) {
        await page.screenshot({ path: `docs/images/site-agent/answered-${locale}-${width}.png` })
      }
      await dialog.locator('.agent-sources a').click()
      await expect(page).toHaveURL(new RegExp(`${prefix}/projects/k39$`))
      await openAgent(page, label)
      await expect(dialog.locator('.agent-markdown')).toContainText('K39')
      await page.keyboard.press('Escape')
      await expect(dialog).not.toBeVisible()
      await expect(page.locator('.site-header').getByRole('button', { name: label, exact: true })).toBeFocused()
      await page.reload()
      await openAgent(page, label)
      await expect(dialog.locator('.agent-markdown')).toContainText('K39')
      await dialog.getByRole('button', { name: english ? 'Clear history' : 'Очистить историю' }).click()
      await expect(dialog.getByRole('button', { name: english ? 'What is K39?' : 'Что такое K39?', exact: true })).toBeVisible()
      await expect(dialog.locator('.agent-markdown')).toHaveCount(0)
      // The modal traps focus even when tabbing backwards from the first control.
      await dialog.locator('button:enabled').first().focus()
      await page.keyboard.press('Shift+Tab')
      await expect(dialog.locator(':focus')).toHaveCount(1)
    })
  }
}

test('shortcut, input guard and offline endpoint without a key', async ({ page, request }) => {
  const response = await request.post('/api/agent', { data: { messages: [{ role: 'user', content: 'K39?' }] } })
  expect(response.status()).toBe(503)
  expect(await response.json()).toEqual({ code: 'offline' })
  await page.goto('/en/projects/context')
  await expect(page.locator('.site-header').getByRole('button', { name: 'AI Bot', exact: true })).toBeVisible()
  await page.waitForFunction(() => !!document.querySelector('.site-agent'))
  await page.keyboard.press('/')
  const dialog = page.getByRole('dialog', { name: 'AI Bot', exact: true })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'What is Context?', exact: true }).click()
  await expect(dialog.getByRole('status').first()).toContainText('offline')
  await page.locator('#site-agent-input').fill('a')
  await page.keyboard.press('/')
  await page.keyboard.type('b')
  await expect(page.locator('#site-agent-input')).toHaveValue('a/b')
  await page.keyboard.press('Escape')
  await page.keyboard.press('Control+k')
  await expect(dialog).toBeVisible()
})

test('rate-limit and interrupted stream are visible and history can be cleared', async ({ page }) => {
  await page.route('**/api/agent', (route) => route.fulfill({ status: 429, json: { code: 'rateLimit' } }))
  await page.goto('/en/contact')
  await openAgent(page, 'AI Bot')
  const dialog = page.getByRole('dialog')
  await dialog.locator('.agent-suggestions button').first().click()
  await expect(dialog.getByRole('status').first()).toContainText('Message limit')
  await page.route('**/api/agent', (route) => route.fulfill({ contentType: 'text/event-stream', body: 'data: {"type":"delta","text":"Partial"}\n\n' }))
  await page.locator('#site-agent-input').fill('K39?')
  await dialog.getByRole('button', { name: 'Send', exact: true }).click()
  await expect(dialog.getByText('Could not finish the answer. Please try again.', { exact: true })).toBeVisible()
})

for (const locale of ['ru', 'en']) {
  test.describe(`${locale} touch drawer`, () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 900 } })
    test('hides keyboard hints and storage notice and shows linked contact', async ({ page }) => {
      const { scopeRefusal } = await import('../apps/web-app/server/agent/guard')
      const question = locale === 'ru' ? 'напиши код на go' : 'Write code in Go'
      await page.route('**/api/agent', (route) => route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'delta', text: scopeRefusal(question, locale) })}\n\ndata: {"type":"done"}\n\n` }))
      await page.goto(locale === 'en' ? '/en/contact' : '/contact')
      await openAgent(page, locale === 'ru' ? 'AI Бот' : 'AI Bot')
      const dialog = page.getByRole('dialog')
      await expect(dialog.locator('.agent-hint')).toBeHidden()
      await expect(dialog.locator('.agent-privacy')).toHaveCount(0)
      await page.locator('#site-agent-input').fill(question)
      await dialog.locator('button[type="submit"]').click()
      const contact = dialog.locator('.agent-markdown a')
      await expect(contact).toHaveAttribute('href', locale === 'en' ? '/en/contact' : '/contact')
      await expect(contact).toHaveText(locale === 'en' ? 'contact Nikolay' : 'свяжитесь с Николаем')
      await expect(dialog.locator('.agent-markdown')).not.toContainText('—')
    })
  })
}
