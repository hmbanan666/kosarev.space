import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

async function openCanvas(page: Page, locale = 'en') {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/en')
  await expect(page.locator('.home-canvas')).toHaveClass(/canvas-enabled/)
  if (locale === 'ru') {
    await page.getByRole('link', { name: 'Русский', exact: true }).click()
  }
  await expect(page.locator('html')).toHaveAttribute('lang', locale)
  await expect(page.locator('.home-canvas')).toHaveClass(/canvas-enabled/)
  return page.locator('.canvas-viewport')
}

for (const locale of ['en', 'ru']) {
  test(`home ships SSR blocks and enhances without hydration warnings (${locale})`, async ({ page, request, browser }) => {
    const path = locale === 'en' ? '/en' : '/'
    const html = await (await request.get(path, { headers: { 'accept-language': locale } })).text()
    for (const text of ['data-block="hero"', 'data-block="context"', 'data-block="dostigus"', 'AI Product Engineer / Fullstack Engineer', 'mailto:nick@kosarev.space']) {
      expect(html).toContain(text)
    }
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (/hydration/i.test(message.text())) {
        errors.push(message.text())
      }
    })
    await openCanvas(page, locale)
    await expect(page.locator('[data-block]')).toHaveCount(11)
    const overflow = await page.locator('[data-block]').evaluateAll((nodes) => nodes.filter((node) => node.scrollHeight > node.clientHeight + 2).map((node) => node.getAttribute('data-block')))
    expect(overflow).toEqual([])
    expect(errors).toEqual([])
    const context = await browser.newContext({ javaScriptEnabled: false, locale: locale === 'ru' ? 'ru-RU' : 'en-GB' })
    const noJs = await context.newPage()
    await noJs.goto(path)
    await expect(noJs.locator('h1')).toBeVisible()
    await expect(noJs.locator(`[data-block="context"] a[href="${locale === 'en' ? '/en' : ''}/projects/context"]`)).toBeVisible()
    await expect(noJs.locator('.canvas-tools')).toHaveCount(0)
    await noJs.locator('.home-catalog > summary').click()
    await expect(noJs.locator('#projects')).toBeVisible()
    await context.close()
  })
}

test('canvas pans by wheel, background drag and arrows, with bounded zoom, map and recenter', async ({ page }) => {
  const viewport = await openCanvas(page)
  await viewport.hover({ position: { x: 450, y: 450 } })
  await page.mouse.wheel(220, 160)
  await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100)
  await page.getByRole('button', { name: 'Recenter', exact: true }).click()
  await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBe(0)
  await viewport.focus()
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBe(96)
  await page.getByRole('button', { name: 'Recenter', exact: true }).click()
  const rect = await viewport.boundingBox()
  // The 16px gap between the introduction and product blocks is empty space.
  await page.mouse.move(rect!.x + 472, rect!.y + 150)
  await page.mouse.down()
  await page.mouse.move(rect!.x + 272, rect!.y + 100, { steps: 8 })
  await page.mouse.up()
  await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100)
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Zoom in', exact: true }).click()
  }
  await expect(page.getByRole('button', { name: 'Zoom in', exact: true })).toBeDisabled()
  await expect(page.locator('.canvas-zoom output')).toHaveText('125%')
  await page.locator('.canvas-minimap').click({ position: { x: 105, y: 55 } })
  await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBeGreaterThan(300)
  await viewport.evaluate((el) => el.scrollTo(1e6, 1e6))
  expect(await viewport.evaluate((el) => el.scrollLeft <= el.scrollWidth - el.clientWidth && el.scrollTop <= el.scrollHeight - el.clientHeight)).toBe(true)
  await page.getByRole('button', { name: 'Recenter', exact: true }).click()
  expect(await viewport.evaluate((el) => [el.scrollLeft, el.scrollTop])).toEqual([0, 0])
})

test('block moves show a target, survive reload, undo and reset locally', async ({ page }) => {
  await openCanvas(page)
  const block = page.locator('[data-block="context"]')
  const grip = block.getByRole('button', { name: 'Move block: Context' })
  const original = await block.getAttribute('style')
  const rect = await grip.boundingBox()
  await page.mouse.move(rect!.x + 12, rect!.y + 12)
  await page.mouse.down()
  await page.mouse.move(rect!.x + 12, rect!.y + 300, { steps: 5 })
  await expect(page.locator('.canvas-target')).toBeVisible()
  await page.mouse.up()
  await expect(block).not.toHaveAttribute('style', original!)
  const moved = await block.getAttribute('style')
  await page.reload()
  await expect(block).toHaveAttribute('style', moved!)
  await page.getByRole('button', { name: 'Reset layout', exact: true }).click()
  await expect(block).toHaveAttribute('style', original!)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(block).toHaveAttribute('style', moved!)
  await grip.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(block).not.toHaveAttribute('style', moved!)
  const beforeCancel = await block.getAttribute('style')
  const handle = await grip.boundingBox()
  await page.mouse.move(handle!.x + 10, handle!.y + 10)
  await page.mouse.down()
  await page.mouse.move(handle!.x + 106, handle!.y + 10)
  await page.keyboard.press('Escape')
  await page.mouse.up()
  await expect(block).toHaveAttribute('style', beforeCancel!)
})

test('mobile and reduced motion keep every block readable without canvas controls on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/en')
  await expect(page.locator('.canvas-tools')).toHaveCount(0)
  await expect(page.locator('.canvas-grip')).toHaveCount(0)
  await expect(page.locator('.canvas-mobile-zone')).toHaveCount(5)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  for (const block of await page.locator('[data-block]').all()) {
    await expect(block).toBeVisible()
  }
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(page.locator('.home-canvas')).toHaveClass(/canvas-enabled/)
  await expect(page.locator('[data-live-cursors]')).toHaveCount(0)
  await page.locator('.canvas-viewport').focus()
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => page.locator('.canvas-viewport').evaluate((el) => el.scrollLeft)).toBe(96)
})

test('cursor faces align across locales with different canvas pan and zoom', async ({ page, browser }) => {
  await openCanvas(page)
  const peerContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  try {
    const peer = await peerContext.newPage()
    await peer.goto('/')
    await expect(peer.locator('[data-live-cursors-bar]')).toBeVisible()
    await expect(page.locator('[data-live-cursors-bar]')).toBeVisible()
    await page.locator('.canvas-viewport').evaluate((el) => el.scrollTo(150, 90))
    const sender = await peer.locator('[data-canvas-world]').boundingBox()
    const x = sender!.x + 600 * 0.85
    const y = sender!.y + 200 * 0.85
    await peer.mouse.move(x, y)
    const cursor = page.locator('[data-live-cursors] > div').first()
    await expect(cursor.locator('img')).toBeVisible()
    await expect.poll(async () => {
      const receiver = await page.locator('[data-canvas-world]').boundingBox()
      const actual = await cursor.boundingBox()
      return Math.abs(actual!.x - (receiver!.x + 600)) + Math.abs(actual!.y - (receiver!.y + 200))
    }).toBeLessThan(5)
    await page.getByRole('button', { name: 'Zoom in', exact: true }).click()
    await expect.poll(async () => {
      const receiver = await page.locator('[data-canvas-world]').boundingBox()
      const actual = await cursor.boundingBox()
      return Math.abs(actual!.x - (receiver!.x + 630)) + Math.abs(actual!.y - (receiver!.y + 210))
    }).toBeLessThan(5)
    await expect(cursor.locator('img')).toHaveJSProperty('complete', true)
    expect(await cursor.locator('img').evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
  } finally {
    await peerContext.close()
  }
})
