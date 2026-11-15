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
    const overflow = await page.locator('[data-block]').evaluateAll((nodes) => nodes.filter((node) => node.scrollHeight > node.clientHeight + 2 || node.scrollWidth > node.clientWidth + 2).map((node) => node.getAttribute('data-block')))
    expect(overflow).toEqual([])
    const outsideBoard = await page.locator('[data-canvas-world]').evaluate((world) => {
      const bounds = world.getBoundingClientRect()
      return [...world.querySelectorAll('[data-block]')].filter((block) => {
        const rect = block.getBoundingClientRect()
        return rect.left < bounds.left || rect.top < bounds.top || rect.right > bounds.right || rect.bottom > bounds.bottom
      }).map((block) => block.getAttribute('data-block'))
    })
    expect(outsideBoard).toEqual([])
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

async function zoomInFully(page: Page) {
  const zoomIn = page.getByRole('button', { name: 'Zoom in', exact: true })
  while (await zoomIn.isEnabled()) {
    await zoomIn.click()
  }
  await expect(page.locator('.canvas-zoom output')).toHaveText('125%')
  await page.locator('.canvas-viewport').evaluate((el) => el.scrollTo(0, 0))
}

test('canvas pans by wheel, background drag and arrows after zoom, with bounded map and fit recenter', async ({ page }) => {
  const viewport = await openCanvas(page)
  const fittedZoom = await page.locator('.canvas-zoom output').textContent()
  await zoomInFully(page)
  await viewport.hover({ position: { x: 450, y: 450 } })
  await page.mouse.wheel(220, 160)
  await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100)
  await page.getByRole('button', { name: 'Recenter', exact: true }).click()
  await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBe(0)
  await expect(page.locator('.canvas-zoom output')).toHaveText(fittedZoom!)
  await zoomInFully(page)
  await viewport.focus()
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBe(96)
  await viewport.evaluate((el) => el.scrollTo(0, 0))
  const hero = await page.locator('[data-block="hero"]').boundingBox()
  const context = await page.locator('[data-block="context"]').boundingBox()
  const gap = (hero!.x + hero!.width + context!.x) / 2
  await page.mouse.move(gap, hero!.y + 100)
  await page.mouse.down()
  await page.mouse.move(gap - 200, hero!.y + 50, { steps: 8 })
  await page.mouse.up()
  await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100)
  await page.locator('.canvas-minimap').click({ position: { x: 70, y: 35 } })
  await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBeGreaterThan(300)
  await viewport.evaluate((el) => el.scrollTo(1e6, 1e6))
  expect(await viewport.evaluate((el) => el.scrollLeft <= el.scrollWidth - el.clientWidth && el.scrollTop <= el.scrollHeight - el.clientHeight)).toBe(true)
  await page.getByRole('button', { name: 'Recenter', exact: true }).click()
  expect(await viewport.evaluate((el) => [el.scrollLeft, el.scrollTop])).toEqual([0, 0])
  await expect(page.locator('.canvas-zoom output')).toHaveText(fittedZoom!)
})

test('block moves show a target, survive reload, undo and reset locally', async ({ page }) => {
  await openCanvas(page)
  const block = page.locator('[data-block="context"]')
  const grip = block.getByRole('button', { name: 'Move block: Context' })
  const original = await block.getAttribute('style')
  const scale = await page.locator('[data-canvas-world]').evaluate((el) => el.getBoundingClientRect().width / (el as HTMLElement).offsetWidth)
  const rect = await grip.boundingBox()
  await page.mouse.move(rect!.x + 12, rect!.y + 12)
  await page.mouse.down()
  await page.mouse.move(rect!.x + 12, rect!.y + 12 + 192 * scale, { steps: 5 })
  await expect(page.locator('.canvas-target')).toBeVisible()
  await page.mouse.up()
  await expect(block).not.toHaveAttribute('style', original!)
  await expect(page.locator('.canvas-divider')).toHaveCount(0)
  const moved = await block.getAttribute('style')
  await page.reload()
  await expect(block).toHaveAttribute('style', moved!)
  await page.getByRole('button', { name: 'Reset layout', exact: true }).click()
  await expect(block).toHaveAttribute('style', original!)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(block).toHaveAttribute('style', moved!)
  await page.getByRole('button', { name: 'Reset layout', exact: true }).click()
  // On the packed board, Dostigus has a valid one-cell move upwards.
  const movable = page.locator('[data-block="dostigus"]')
  const handleButton = movable.locator('.canvas-grip')
  const blockOriginal = await movable.getAttribute('style')
  await handleButton.focus()
  await page.keyboard.press('ArrowUp')
  await expect(movable).not.toHaveAttribute('style', blockOriginal!)
  const beforeCancel = await movable.getAttribute('style')
  await movable.evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished)))
  const handle = await handleButton.boundingBox()
  await page.mouse.move(handle!.x + 10, handle!.y + 10)
  await page.mouse.down()
  await page.mouse.move(handle!.x + 106, handle!.y + 10)
  await expect(page.locator('.canvas-target')).toBeVisible()
  await page.keyboard.press('Escape')
  await page.mouse.up()
  await expect(movable).toHaveAttribute('style', beforeCancel!)
})

test('blocks lift and highlight on hover, then ease to a snapped position', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openCanvas(page)
  const movable = page.locator('[data-block="dostigus"]')
  const border = await movable.evaluate((el) => getComputedStyle(el).borderTopColor)
  await movable.hover()
  await expect.poll(() => movable.evaluate((el) => getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, -2)')
  expect(await movable.evaluate((el) => getComputedStyle(el).borderTopColor)).not.toBe(border)
  await movable.locator('.canvas-grip').focus()
  await page.keyboard.press('ArrowUp')
  const motion = await movable.evaluate((el) => ({ properties: getComputedStyle(el).transitionProperty, duration: getComputedStyle(el).transitionDuration }))
  expect(motion.properties).toContain('top')
  expect(motion.duration).toContain('0.24s')
  await expect(movable).toHaveCSS('top', '192px')
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
  const hero = page.locator('[data-block="hero"]')
  await hero.hover()
  expect(await hero.evaluate((el) => ({ transform: getComputedStyle(el).transform, transition: getComputedStyle(el).transitionProperty }))).toEqual({ transform: 'none', transition: 'none' })
  await zoomInFully(page)
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
    await peer.locator('[data-live-cursors-bar]').click()
    const peerAvatar = await peer.locator('[data-live-cursors-profile] img').getAttribute('src')
    await peer.locator('[data-live-cursors-bar]').click()
    await expect(page.locator('[data-live-cursors-bar]')).toBeVisible()
    await zoomInFully(page)
    await page.locator('.canvas-viewport').evaluate((el) => el.scrollTo(150, 90))
    const sender = await peer.locator('[data-canvas-world]').boundingBox()
    const senderScale = await peer.locator('[data-canvas-world]').evaluate((el) => el.getBoundingClientRect().width / (el as HTMLElement).offsetWidth)
    const x = sender!.x + 600 * senderScale
    const y = sender!.y + 200 * senderScale
    await peer.mouse.move(x, y)
    // Other parallel browser tests can share this room. Follow our own peer.
    const cursor = page.locator('[data-live-cursors] > div').filter({ has: page.locator(`img[src="${peerAvatar}"]`) })
    await expect(cursor.locator('img')).toBeVisible()
    await expect.poll(async () => {
      const receiver = await page.locator('[data-canvas-world]').boundingBox()
      const actual = await cursor.boundingBox()
      const scale = await page.locator('[data-canvas-world]').evaluate((el) => el.getBoundingClientRect().width / (el as HTMLElement).offsetWidth)
      return Math.abs(actual!.x - (receiver!.x + 600 * scale)) + Math.abs(actual!.y - (receiver!.y + 200 * scale))
    }).toBeLessThan(5)
    await page.getByRole('button', { name: 'Zoom out', exact: true }).click()
    await expect.poll(async () => {
      const receiver = await page.locator('[data-canvas-world]').boundingBox()
      const actual = await cursor.boundingBox()
      const scale = await page.locator('[data-canvas-world]').evaluate((el) => el.getBoundingClientRect().width / (el as HTMLElement).offsetWidth)
      return Math.abs(actual!.x - (receiver!.x + 600 * scale)) + Math.abs(actual!.y - (receiver!.y + 200 * scale))
    }).toBeLessThan(5)
    await expect(cursor.locator('img')).toHaveJSProperty('complete', true)
    expect(await cursor.locator('img').evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
  } finally {
    await peerContext.close()
  }
})
