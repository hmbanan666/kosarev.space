import { expect, test } from '@playwright/test'

test.describe('homepage', () => {
  test('renders all sections', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('#projects')).toBeVisible()
    await expect(page.locator('#skills')).toBeVisible()
    await expect(page.locator('#contacts')).toBeVisible()
  })

  test('has correct page title', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Косарев|Kosarev/)
  })

  test('navigation to projects works', async ({ page }) => {
    await page.goto('/')

    await page.locator('a[href="#projects"]').first().click()
    await expect(page.locator('#projects')).toBeInViewport()
  })

  test('language switcher is visible', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('button', { hasText: /English|Русский/ })).toBeVisible({ timeout: 10000 })
  })
})

test.describe('English locale (/en)', () => {
  test('renders correct content', async ({ page }) => {
    await page.goto('/en')

    await expect(page).toHaveTitle(/Kosarev/)
    await expect(page.locator('#projects')).toBeVisible()
    await expect(page.locator('#skills')).toBeVisible()
    await expect(page.locator('#contacts')).toBeVisible()
  })

  test('has correct section headings', async ({ page }) => {
    await page.goto('/en')

    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Skills & Stack' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Contacts' })).toBeVisible()
  })

  test('shows English footer', async ({ page }) => {
    await page.goto('/en')

    const footer = page.locator('footer')
    await expect(footer).toContainText('Nick Kosarev')
    await expect(footer).toContainText(new Date().getFullYear().toString())
  })
})

test.describe('SEO meta tags', () => {
  test('has og:image', async ({ page }) => {
    await page.goto('/en')

    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogImage).toHaveAttribute('content', /og-image\.png/)
  })

  test('English page has correct meta', async ({ page }) => {
    await page.goto('/en')

    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Fullstack Developer/)
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Kosarev/)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /kosarev\.space\/en/)
  })

  test('has JSON-LD structured data', async ({ page }) => {
    await page.goto('/en')

    const jsonLd = page.locator('script[type="application/ld+json"]')
    const content = await jsonLd.textContent()
    const data = JSON.parse(content!)

    expect(data['@type']).toBe('Person')
    expect(data.name).toBe('Nick Kosarev')
    expect(data.url).toBe('https://kosarev.space')
    expect(data.sameAs).toContain('https://github.com/hmbanan666')
  })

  test('has canonical link', async ({ page }) => {
    await page.goto('/en')

    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical).toHaveAttribute('href', /kosarev\.space/)
  })

  test('has favicon', async ({ page }) => {
    await page.goto('/en')

    const favicon = page.locator('link[rel="icon"]')
    await expect(favicon).toHaveAttribute('href', '/favicon.svg')
  })
})

test.describe('robots.txt and sitemap', () => {
  test('robots.txt is accessible', async ({ request }) => {
    const response = await request.get('/robots.txt')

    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain('User-agent:')
  })

  test('sitemap is accessible and valid XML', async ({ request }) => {
    const response = await request.get('/sitemap_index.xml')

    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain('<?xml')
    expect(body).toContain('sitemapindex')
  })
})

test.describe('security headers', () => {
  test('response includes security headers', async ({ request }) => {
    const response = await request.get('/en')
    const headers = response.headers()

    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['permissions-policy']).toContain('camera=()')
    expect(headers['content-security-policy']).toContain('default-src')
  })
})
