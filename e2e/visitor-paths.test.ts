import { expect, test } from '@playwright/test'

for (const locale of ['ru', 'en']) {
  const prefix = locale === 'ru' ? '' : '/en'

  test(`project headings open the corresponding project (${locale})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${prefix}/projects`, { waitUntil: 'domcontentloaded' })
    for (const name of ['Context', 'K39', 'Dostigus']) {
      const link = page.getByRole('heading', { level: 3, name, exact: true }).getByRole('link')
      await expect(link).toHaveAttribute('href', `${prefix}/projects/${name.toLowerCase()}`)
    }
    const first = page.getByRole('link', { name: 'Context', exact: true })
    await expect(first).toBeInViewport()
    await first.press('Enter')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Context')
  })
}

test('a mobile reader can search cases immediately and refine by area with the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/en/cases')
  await expect(page.getByRole('searchbox')).toBeInViewport()
  const area = page.getByRole('combobox', { name: 'Area of work' })
  await expect(area).toBeHidden()
  await page.getByText('Area and technology', { exact: true }).press('Enter')
  await expect(area).toBeVisible()
  await page.goto('/en/cases?focus=systems')
  await expect(area).toBeVisible()
})

test('contact offers one set of actions and keeps footer navigation', async ({ page }) => {
  await page.goto('/en/contact')
  await expect(page.getByRole('button', { name: 'Copy email address' })).toHaveCount(1)
  await expect(page.getByRole('main').getByRole('link', { name: 'Telegram' })).toBeVisible()
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'CV', exact: true })).toBeVisible()
})

for (const locale of ['ru', 'en']) {
  test(`a broken case link leads back to the localized catalog without JavaScript (${locale})`, async ({ browser }) => {
    const prefix = locale === 'ru' ? '' : '/en'
    const context = await browser.newContext({ javaScriptEnabled: false, locale })
    try {
      const page = await context.newPage()
      const response = await page.goto(`${prefix}/cases/unknown-audit-case`)
      expect(response?.status()).toBe(404)
      const recovery = page.getByRole('main').getByRole('link', { name: locale === 'ru' ? 'Все кейсы' : 'All cases', exact: true })
      await expect(recovery).toHaveAttribute('href', `${prefix}/cases`)
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      await recovery.click()
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(locale === 'ru' ? 'Кейсы' : 'Case studies')
    } finally {
      await context.close()
    }
  })
}

test('retrying the case catalog distinguishes an outage from an empty collection', async ({ page }) => {
  let available = false
  await page.route(/\/api\/cases\?/, (route) => available
    ? route.fulfill({ json: [] })
    : route.fulfill({ status: 503, json: {} }))
  await page.goto('/en/contact')
  await expect(page.getByRole('button', { name: 'Copy email address' })).toBeEnabled()
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Cases', exact: true }).click()
  const main = page.getByRole('main')
  await expect(main.getByRole('alert')).toContainText('Case studies could not be loaded.')
  await expect(main.getByText('0 cases', { exact: true })).toHaveCount(0)
  available = true
  await main.getByRole('button', { name: 'Try again' }).click()
  await expect(main.getByRole('status')).toHaveText('No cases are available yet.')
  await expect(main.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/en/projects')
  await expect(main.getByRole('link', { name: 'Reset filters' })).toHaveCount(0)
})
