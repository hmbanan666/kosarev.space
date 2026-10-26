import { expect, test } from '@playwright/test'

const cases = [
  { key: 'qa-invoice', title: 'Invoice reconciliation reference', description: 'Reliable invoice reconciliation for a migration', tags: ['Node.js', 'PostgreSQL'] },
  { key: 'qa-build', title: 'Build infrastructure reference', description: 'Repeated container builds', tags: ['Docker', 'CI/CD'] },
  ...Array.from({ length: 5 }, (_, index) => ({ key: `qa-interface-${index}`, title: `Interface reference ${index}`, description: 'Frontend case fixture', tags: ['Nuxt'] })),
].map((item) => ({ ...item, icon: 'i-lucide-file-text', stats: { views: 0, reactions: {} } }))

async function openCatalog(page: import('@playwright/test').Page) {
  await page.route(/\/api\/cases(?:\?.*)?$/, (route) => route.fulfill({ json: cases }))
  await page.route(/\/api\/cases\/qa-[^/?]+(?:\?.*)?$/, (route) => {
    const key = new URL(route.request().url()).pathname.split('/').at(-1)
    const found = cases.find((item) => item.key === key)!
    return route.fulfill({ json: { ...found, image: null, task: 'A bounded test challenge.', solution: 'Implementation details for the test fixture.', result: 'A verifiable outcome.', related: [] } })
  })
  await page.route(/\/api\/cases\/qa-[^/]+\/view/, (route) => route.fulfill({ status: 204 }))
  await page.goto('/en/cv')
  await expect(page.getByRole('button', { name: 'Switch color theme', exact: true })).toBeVisible()
  await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Cases', exact: true }).click()
  await expect(page.locator('.case-preview')).toHaveCount(6)
  await expect(page.getByRole('heading', { name: 'Invoice reconciliation reference', exact: true })).toBeVisible()
}

test('case discovery exposes all work and keeps a shareable search context through detail and back', async ({ page }) => {
  await openCatalog(page)
  await page.getByRole('link', { name: 'Show all 7 cases' }).click()
  await expect(page.locator('.case-preview')).toHaveCount(7)
  await page.getByRole('searchbox', { name: 'Search work', exact: true }).fill('invoice')
  await page.getByRole('button', { name: 'Find cases', exact: true }).click()
  await expect(page).toHaveURL(/q=invoice/)
  await expect(page.locator('.case-preview')).toHaveCount(1)
  await page.getByRole('link', { name: 'Read case: Invoice reconciliation reference' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Invoice reconciliation reference')
  await page.getByRole('link', { name: 'Technical details', exact: true }).click()
  await expect(page.locator('#case-details')).toHaveAttribute('open', '')
  await page.getByRole('link', { name: 'Back to these results', exact: true }).click()
  await expect(page).toHaveURL(/q=invoice/)
  await expect(page.getByRole('searchbox', { name: 'Search work', exact: true })).toHaveValue('invoice')
  await expect(page.locator('.case-preview')).toHaveCount(1)
})

test('ownership links show a contrasting keyboard focus indicator in both themes', async ({ page }) => {
  await page.goto('/en')
  const theme = page.getByRole('button', { name: 'Switch color theme', exact: true })
  const links = page.getByRole('navigation', { name: 'Explore work by responsibility' }).getByRole('link')
  for (const dark of [false, true]) {
    await expect(theme).toBeVisible()
    if ((await theme.getAttribute('aria-pressed')) !== String(dark)) {
      await theme.click()
    }
    await links.first().focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    for (let index = 0; index < 3; index++) {
      const link = links.nth(index)
      await expect(link).toBeFocused()
      const indicator = await link.evaluate((element) => {
        const style = getComputedStyle(element)
        const luminance = (color: string) => {
          const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((channel) => {
            const value = channel / 255
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
          })
          return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722
        }
        const background = getComputedStyle(element.closest('.ownership-map')!).backgroundColor
        const values = [luminance(style.outlineColor), luminance(background)].sort((a, b) => a - b)
        return { width: Number.parseFloat(style.outlineWidth), style: style.outlineStyle, contrast: (values[1]! + 0.05) / (values[0]! + 0.05) }
      })
      expect(indicator.style).toBe('solid')
      expect(indicator.width).toBeGreaterThanOrEqual(2)
      expect(indicator.contrast).toBeGreaterThanOrEqual(3)
      await page.keyboard.press('Tab')
    }
  }
})

test('area and technology filters combine, explain no results, and can reset', async ({ page }) => {
  await openCatalog(page)
  await page.getByRole('combobox', { name: 'Area of work', exact: true }).selectOption('delivery')
  await page.getByRole('button', { name: 'Find cases', exact: true }).click()
  await expect(page.locator('.case-preview')).toHaveCount(1)
  await expect(page.locator('.case-preview')).toContainText('Build infrastructure reference')
  await page.getByRole('link', { name: 'Русский', exact: true }).click()
  expect(new URL(page.url()).searchParams.get('focus')).toBe('delivery')
  await page.getByRole('link', { name: 'English', exact: true }).click()
  expect(new URL(page.url()).searchParams.get('focus')).toBe('delivery')
  await page.getByRole('combobox', { name: 'Technology', exact: true }).selectOption('Nuxt')
  await page.getByRole('button', { name: 'Find cases', exact: true }).click()
  await expect(page.getByText('No matching cases. Try a broader search or reset the filters.')).toBeVisible()
  await page.locator('.case-empty').getByRole('link', { name: 'Reset filters' }).click()
  await expect(page.locator('.case-preview')).toHaveCount(6)
})

test('contact copy confirms success and preserves a visible mail link', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/en')
  await page.getByRole('button', { name: 'Copy email address', exact: true }).click()
  await expect(page.getByText('Email address copied.', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('nick@kosarev.space')
  await expect(page.locator('footer a[href="mailto:nick@kosarev.space"]')).toBeVisible()
})

test('clipboard failure offers a focused manually selectable address', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Unavailable')) } }))
  await page.goto('/en')
  await page.getByRole('button', { name: 'Copy email address', exact: true }).click()
  const email = page.getByRole('textbox', { name: 'Email address', exact: true })
  await expect(email).toBeFocused()
  await expect(email).toHaveValue('nick@kosarev.space')
  await expect(page.getByText('Copy unavailable. Select the address below or use the email link.')).toBeVisible()
})

test('mobile navigation supports keyboard and keeps native contact and locale links', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/en')
  await expect(page.getByRole('button', { name: 'Switch color theme', exact: true })).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  const menu = page.getByRole('button', { name: 'Open navigation', exact: true })
  await menu.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.site-mobile-menu nav')).toBeVisible()
  await expect(page.locator('.site-mobile-menu a[href="mailto:nick@kosarev.space"]')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toBeFocused()
  await expect(page.locator('.site-mobile-menu nav')).not.toBeVisible()
  await expect(page.getByRole('link', { name: 'Русский', exact: true })).toHaveAttribute('href', '/#main-content')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('case filters and critical content work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/en')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nick Kosarev')
  await page.getByRole('searchbox', { name: 'Search work', exact: true }).fill('cache')
  await page.getByRole('combobox', { name: 'Area of work', exact: true }).selectOption('delivery')
  await page.getByRole('button', { name: 'Find cases', exact: true }).click()
  await expect(page).toHaveURL(/q=cache.*focus=delivery/)
  await expect(page.getByRole('searchbox', { name: 'Search work', exact: true })).toHaveValue('cache')
  await expect(page.locator('footer a[href="mailto:nick@kosarev.space"]')).toBeVisible()
  await context.close()
})

test('live demonstration opens only on request, stays confined and closes its connection on stop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const sockets: { closed: boolean }[] = []
  page.on('websocket', (socket) => {
    if (socket.url().includes('/_live-cursors-ws')) {
      const entry = { closed: false }
      sockets.push(entry)
      socket.on('close', () => {
        entry.closed = true
      })
    }
  })
  await page.goto('/en')
  await expect(page.getByRole('button', { name: 'Start live demo', exact: true })).toBeEnabled()
  expect(sockets).toHaveLength(0)
  await page.getByRole('button', { name: 'Start live demo', exact: true }).click()
  await expect(page.locator('[data-live-demo]')).toBeVisible()
  await expect.poll(() => sockets.length).toBe(1)
  await expect(page.locator('[data-live-cursors]')).toHaveCount(0)
  await page.getByRole('button', { name: 'Stop live demo', exact: true }).click()
  await expect(page.locator('[data-live-demo]')).toHaveCount(0)
  await expect.poll(() => sockets[0]?.closed).toBe(true)
  await page.getByRole('button', { name: 'Start live demo', exact: true }).click()
  await expect.poll(() => sockets.length).toBe(2)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => sockets[1]?.closed).toBe(true)
  await expect(page.getByRole('button', { name: 'Start live demo', exact: true })).toBeDisabled()
})
