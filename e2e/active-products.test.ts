import { expect, test } from '@playwright/test'

for (const locale of ['ru', 'en']) {
  test(`active products are reachable from the CV and distinct from the archive (${locale})`, async ({ page }) => {
    const prefix = locale === 'en' ? '/en' : ''
    await page.goto(`${prefix}/cv`)
    await page.locator('.site-desktop-nav').getByRole('link', { name: locale === 'en' ? 'Projects' : 'Проекты', exact: true }).click()
    const section = page.locator('#projects')
    await expect(section).toBeInViewport()
    await expect(section.locator('[data-active-product]')).toHaveCount(2)
    const k39 = section.locator('[data-active-product="k39"]')
    const woodlands = section.locator('[data-active-product="woodlands"]')
    await expect(k39.getByRole('link', { name: locale === 'en' ? 'Explore K39 (in Russian)' : 'Открыть K39' })).toHaveAttribute('href', 'https://k39.online')
    await expect(k39.locator('a[href="https://github.com/hmbanan666/k39"]')).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(woodlands.getByRole('link', { name: locale === 'en' ? 'Play in Telegram' : 'Играть в Telegram' })).toHaveAttribute('href', 'https://t.me/WoodlandsGameBot')
    await expect(woodlands.locator('a[href*="github.com"]')).toHaveCount(0)
    await expect(woodlands.locator('figcaption')).toHaveText(locale === 'en' ? 'Game interface with a demo deal.' : 'Интерфейс игры с демонстрационным раскладом.')
    for (const image of await section.locator('[data-active-product] img').all()) {
      await image.scrollIntoViewIfNeeded()
      await expect(image).toHaveJSProperty('complete', true)
      expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0)
    }
    await expect(section.locator('[data-project-archive]')).toHaveCount(3)
    await expect(section.locator('a[href="https://github.com/nextorders/food"]')).toBeVisible()
  })
}

test('product links and archive render without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.locator('#projects [data-active-product]')).toHaveCount(2)
  await expect(page.locator('#projects a[href="https://t.me/WoodlandsGameBot"]')).toBeVisible()
  await expect(page.locator('#projects [data-project-archive]')).toHaveCount(3)
  await context.close()
})
