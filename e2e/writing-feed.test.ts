import { expect, test } from '@playwright/test'

test.use({ locale: 'ru-RU', reducedMotion: 'reduce' })

for (const locale of ['ru', 'en']) {
  const prefix = locale === 'en' ? '/en' : ''
  const label = locale === 'en' ? 'Writing' : 'Публикации'
  for (const width of [390, 1024, 1280]) {
    test(`Writing connects the site, publication and project (${locale}, ${width}px)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`${prefix}/cv`)
      if (width <= 1100) {
        await page.locator('.site-mobile-menu summary').click()
        await page.locator('#mobile-navigation').getByRole('link', { name: label, exact: true }).click()
        await expect(page.locator('.site-mobile-menu')).not.toHaveAttribute('open')
      } else {
        await page.locator('.site-desktop-nav').getByRole('link', { name: label, exact: true }).click()
      }
      await expect(page).toHaveURL(`${prefix}/writing`)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(label)
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      await expect(page.locator('.publication-entry').filter({ has: page.locator('a[href$="/writing/k39-draft-permissions"]') })).toHaveCount(1)
      await expect(page.locator('.publication-entry').filter({ has: page.locator('a[href$="/writing/k39-draft-permissions"]') }).locator('.publication-meta')).toContainText(locale === 'en' ? 'Article' : 'Статья')
      await expect(page.locator('.publication-entry').filter({ has: page.locator('a[href$="/writing/k39-draft-permissions"]') }).locator('time')).toHaveAttribute('datetime', '2026-10-28')
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await page.locator('.publication-entry').filter({ has: page.locator('a[href$="/writing/k39-draft-permissions"]') }).getByRole('link').click()
      await expect(page).toHaveURL(`${prefix}/writing/k39-draft-permissions`)
      await expect(page.locator('.writing-heading time')).toHaveAttribute('datetime', '2026-10-28')
      await page.locator('.writing-related').getByRole('link', { name: 'K39', exact: true }).click()
      await expect(page.locator('#project-k39')).toBeInViewport()
      await expect(page.locator('#project-k39 .related-publications a')).toHaveAttribute('href', `${prefix}/writing/k39-draft-permissions`)
      await expect(page.locator('#project-woodlands .related-publications')).toHaveCount(0)
    })
  }

  test(`Writing is server rendered and locale switching keeps the feed (${locale})`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(`${prefix}/writing`)
    await expect(page.locator('.publication-entry').filter({ has: page.locator('a[href$="/writing/k39-draft-permissions"]') })).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://kosarev.space${prefix}/writing`)
    await page.locator('.site-language').click()
    await expect(page).toHaveURL(`${locale === 'en' ? '' : '/en'}/writing`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(locale === 'en' ? 'Публикации' : 'Writing')
    await context.close()
  })
}

test('unknown publication slugs return 404 in both locales', async ({ request }) => {
  for (const prefix of ['', '/en']) {
    const response = await request.get(`${prefix}/writing/not-a-publication`)
    expect(response.status()).toBe(404)
  }
})
