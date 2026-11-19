import { expect, test } from './board-fixture'

test('visitors share live drags and durable drops across locales and mobile', { tag: '@board-write' }, async ({ page, browser }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const peer = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  try {
    await peer.context().addCookies([{ name: 'i18n_redirected', value: 'ru', url: 'http://localhost:3333' }])
    await peer.addInitScript(() => localStorage.setItem('portfolio-stickers-v1', '{"version":2,"placed":[]}'))
    await Promise.all([page.goto('/en'), peer.goto('/')])
    await expect(peer.locator('html')).toHaveAttribute('lang', 'ru')
    for (const client of [page, peer]) {
      await expect(client.locator('[data-board-ready="true"]')).toBeVisible()
    }
    // Each visitor takes a turn. Inspect the observer before releasing the pointer.
    for (const [index, selector] of ['[data-block="cv"]', '[data-sticker="monkey-bright-idea"]'].entries()) {
      const [actor, observer] = index === 0 ? [page, peer] : [peer, page]
      const item = actor.locator(selector)
      const observed = observer.locator(selector)
      const initial = await observed.getAttribute('style')
      const handle = index === 0 ? item.locator('.canvas-grip') : item
      const rect = (await handle.boundingBox())!
      const x = rect.x + rect.width / 2
      const y = rect.y + rect.height / 2
      await actor.mouse.move(x, y)
      await actor.mouse.down()
      await actor.mouse.move(x + 110, y + 60, { steps: 12 })
      await expect(observed).toHaveAttribute('data-held-by', /.+/)
      await expect(observed).not.toHaveAttribute('style', initial!)
      const cursor = observer.locator('[data-live-cursors] > div').first()
      await expect(cursor.locator('img')).toBeVisible()
      await expect.poll(async () => {
        const face = await cursor.boundingBox()
        return face ? Math.hypot(face.x - (x + 110), face.y - (y + 60)) : Infinity
      }).toBeLessThan(8)
      const name = index === 0 ? 'block' : 'sticker'
      const path = info.outputPath(`shared-${name}.png`)
      await observer.screenshot({ path })
      await info.attach(`Remote ${name} and cursor`, { path, contentType: 'image/png' })
      await actor.mouse.up()
      await expect(observed).not.toHaveAttribute('data-held-by')
      const final = await observed.getAttribute('style')
      expect(final).not.toBe(initial)
      await observer.reload()
      await expect(observed).toHaveAttribute('style', final!)
    }
    await peer.setViewportSize({ width: 390, height: 844 })
    const overview = peer.locator('[data-overview-block="cv"]')
    const position = await overview.getAttribute('style')
    await page.locator('[data-block="cv"] .canvas-grip').press('ArrowRight')
    await expect(overview).not.toHaveAttribute('style', position!)
    await expect(peer.locator('.canvas-grip, .sheet-toggle')).toHaveCount(0)
  } finally {
    await peer.close()
  }
})
