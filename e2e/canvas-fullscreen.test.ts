import { expect, test } from '@playwright/test'

for (const locale of ['ru', 'en']) {
  const prefix = locale === 'en' ? '/en' : ''
  test(`header navigates to real localized pages (${locale})`, async ({ page }) => {
    await page.context().addCookies([{ name: 'i18n_redirected', value: locale, url: 'http://localhost:3333' }])
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto(prefix || '/')
    await expect(page.locator('.home-canvas')).toHaveClass(/canvas-enabled/)
    for (const path of ['/projects', '/cases', '/writing', '/cv', '/contact']) {
      const link = page.locator(`.site-desktop-nav a[href="${prefix}${path}"]`)
      await link.click()
      await expect(page).toHaveURL(new RegExp(`${prefix}${path}$`))
      await expect(link).toHaveAttribute('aria-current', 'page')
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://kosarev.space${prefix}${path}`)
    }
  })
}

for (const viewport of [{ width: 1280, height: 800 }, { width: 1920, height: 1080 }]) {
  test(`home fills the viewport with aligned starting gutters and a larger board at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/en')
    await expect(page.locator('.home-canvas')).toHaveClass(/canvas-enabled/)
    await page.mouse.move(0, 0)
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(viewport.height)
    await expect(page.locator('.home-catalog')).toHaveCount(0)
    await expect(page.locator('.site-footer')).toBeHidden()
    const gutters = await page.locator('.canvas-viewport').evaluate((element) => {
      const frame = element.getBoundingClientRect()
      const board = element.querySelector('[data-canvas-world]')!.getBoundingClientRect()
      return [board.left - frame.left, frame.right - board.right, board.top - frame.top, frame.bottom - board.bottom]
    })
    expect(gutters[0]).toBeCloseTo(gutters[2]!, 0)
    expect(gutters[1]).toBeLessThan(0)
    expect(gutters[3]).toBeLessThan(0)
    const left = await page.locator('.site-header-inner').evaluate((el) => el.getBoundingClientRect().left)
    expect(gutters[0]).toBeCloseTo(left, 0)
    expect(await page.locator('.canvas-viewport').evaluate((el) => el.clientWidth)).toBe(viewport.width)
    await expect(page.locator('body')).not.toContainText(/[↗▸→←]/)
  })
}

for (const locale of ['ru', 'en']) {
  test(`legacy home anchors preserve locale and query (${locale})`, async ({ page }) => {
    const prefix = locale === 'en' ? '/en' : ''
    const errors: string[] = []
    page.on('console', (message) => {
      if (/hydration/i.test(message.text())) {
        errors.push(message.text())
      }
    })
    await page.context().addCookies([{ name: 'i18n_redirected', value: locale, url: 'http://localhost:3333' }])
    for (const [hash, destination] of [
      ['projects', '/projects'], ['project-nextorders', '/projects#project-nextorders'],
      ['skills', '/cases'], ['experience', '/cv#experience'], ['contacts', '/contact'],
    ]) {
      await page.goto(`${prefix || '/'}?q=cache&focus=delivery&tech=Nuxt&all=1#${hash}`)
      await expect.poll(() => new URL(page.url()).pathname + new URL(page.url()).hash).toBe(`${prefix}${destination}`)
      expect(new URL(page.url()).searchParams.get('q')).toBe('cache')
      expect(new URL(page.url()).searchParams.get('focus')).toBe('delivery')
      expect(new URL(page.url()).searchParams.get('tech')).toBe('Nuxt')
      expect(new URL(page.url()).searchParams.get('all')).toBe('1')
      if (hash === 'experience') {
        await expect(page.locator('#experience')).toBeInViewport()
      }
    }
    expect(errors).toEqual([])
    // Changes to an already mounted home's hash must take the same route.
    await page.goto(prefix || '/')
    await expect(page.locator('.home-canvas')).toHaveClass(/canvas-enabled/)
    await page.evaluate(() => {
      location.hash = 'projects'
    })
    await expect(page).toHaveURL(new RegExp(`${prefix}/projects$`))
  })
}
