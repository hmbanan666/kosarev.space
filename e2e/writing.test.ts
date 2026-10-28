import { expect, test } from '@playwright/test'

test.use({ locale: 'ru-RU' })

const articlePath = '/writing/k39-draft-permissions'
const titles = {
  ru: 'Как K39 отделяет правки AI-агента от публикации',
  en: 'How K39 separates AI edits from publication',
}

for (const locale of ['ru', 'en'] as const) {
  const prefix = locale === 'en' ? '/en' : ''
  for (const width of [390, 1280]) {
    test(`K39 article is readable and linked to its product (${locale}, ${width}px)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(`${prefix}/`)
      await page.locator('[data-active-product="k39"]').getByRole('link', {
        name: titles[locale],
      }).click()
      await expect(page).toHaveURL(`${prefix}${articlePath}`)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles[locale])
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      await expect(page.locator('article h2')).toHaveCount(6)
      await expect(page.locator('article pre')).toHaveCount(2)
      await expect(page.locator('article pre').last()).toContainText('-u DATABASE_URL_TEST')
      await expect(page.locator('article a[href^="https://github.com/hmbanan666/k39/"]')).toHaveCount(15)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://kosarev.space${prefix}${articlePath}`)
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', `https://kosarev.space/en${articlePath}`)
      const articleData = await page.locator('script[type="application/ld+json"]').allTextContents()
      expect(articleData.some((value) => {
        const data = JSON.parse(value)
        return data['@type'] === 'Article' && data.headline === titles[locale] && data.inLanguage === locale
      })).toBe(true)
      await page.locator('.writing-end').getByRole('link', { name: locale === 'en' ? 'Back to projects' : 'К проектам' }).click()
      await expect(page.locator('#projects')).toBeInViewport()
      await expect(page.locator('[data-active-product]')).toHaveCount(2)
    })
  }

  test(`article copy and sources are server rendered (${locale})`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(`${prefix}${articlePath}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles[locale])
    await expect(page.locator('html')).toHaveAttribute('lang', locale)
    await expect(page.locator('article')).toContainText('181')
    await expect(page.locator('article')).toContainText(locale === 'en' ? 'production tokens' : 'production-токенов')
    await expect(page.locator('article ol li')).toHaveCount(5)
    await expect(page.locator('article h2')).toHaveCount(6)
    await expect(page.locator('.site-language')).toHaveAttribute('href', `${locale === 'en' ? '' : '/en'}${articlePath}`)
    await context.close()
  })
}

test('article language switching keeps the route and updates text and metadata', async ({ page }) => {
  await page.goto(articlePath)
  await page.getByRole('link', { name: 'English', exact: true }).click()
  await expect(page).toHaveURL(`/en${articlePath}`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles.en)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page).toHaveTitle(new RegExp(titles.en))
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://kosarev.space/en${articlePath}`)
  await page.getByRole('link', { name: 'Русский', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles.ru)
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru')
})
