import { expect, test } from '@playwright/test'

for (const locale of ['ru', 'en'] as const) {
  const prefix = locale === 'en' ? '/en' : ''
  test(`${locale} CV and print share facts, dates, education and archive status`, async ({ page }) => {
    await page.goto(`${prefix}/cv`)
    const doc = page.locator('[data-cv-document]')
    await expect(doc).toHaveAttribute('data-cv-ready', locale)
    await expect(doc.locator('h1')).toHaveText(locale === 'en' ? 'Nick Kosarev' : 'Николай Косарев')
    await expect(doc.locator('[data-cv-entry]')).toHaveCount(5)
    const expi = doc.locator('[data-cv-entry="expi"]')
    await expect(expi).toContainText('2026')
    await expect(expi).toContainText(locale === 'en' ? '6 mo' : '6 месяцев')
    await expect(expi.locator('li')).toHaveCount(6)
    await expect(doc).toContainText(locale === 'en' ? 'Incomplete higher education' : 'Неоконченное высшее')
    await expect(doc).toContainText(locale === 'en' ? 'Project closed in 2026' : 'Проект закрыт в 2026 году')
    await expect(doc.locator('a[href="mailto:nick@kosarev.space"]')).toBeVisible()
    await expect(page.locator(`a[href="${locale === 'en' ? '/cv-en.pdf' : '/cv.pdf'}"]`)).toHaveAttribute('download')
    const facts = await doc.locator('[data-cv-fact]').allTextContents()
    const summary = await doc.locator('[data-cv-summary]').textContent()
    await page.goto(`${prefix}/cv/print`)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    expect(await page.locator('[data-cv-fact]').allTextContents()).toEqual(facts)
    expect(await page.locator('[data-cv-summary]').textContent()).toBe(summary)
    await expect(page.locator('[data-cv-document]')).toHaveAttribute('lang', locale)
  })
}

test('CV remains readable on mobile, supports keyboard focus and both color themes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/en/cv')
  const theme = page.getByRole('button', { name: 'Switch color theme' })
  await theme.focus()
  await expect(theme).toBeFocused()
  const before = await theme.getAttribute('aria-pressed')
  await page.keyboard.press('Enter')
  await expect(theme).toHaveAttribute('aria-pressed', before === 'true' ? 'false' : 'true')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.keyboard.press('Enter')
  await expect(theme).toHaveAttribute('aria-pressed', before!)
})

test('homepage archives closed projects without advertising their old live services', async ({ page }) => {
  await page.goto('/en')
  const projects = page.locator('#projects')
  await expect(projects.locator('[data-project-archive]')).toHaveCount(3)
  await expect(projects.locator('a[href="https://startodel.ru"]')).toHaveCount(0)
  await expect(projects.locator('a[href="https://meloteka.ru"]')).toHaveCount(0)
  await expect(projects.locator('a[href="https://chatgame.space"]')).toHaveCount(0)
  await expect(projects.getByText('NextOrders', { exact: true })).toBeVisible()
  await expect(projects.locator('a[href="https://github.com/nextorders/food"]')).toHaveAttribute('target', '_blank')
})
