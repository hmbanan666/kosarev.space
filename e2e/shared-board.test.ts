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
      await observer.screenshot({ path, style: '#nuxt-devtools-container { display: none !important; }' })
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

test('two visitors race for one design, then return it by click and by dragging', { tag: '@board-write' }, async ({ page, browser }) => {
  test.slow()
  await page.setViewportSize({ width: 1440, height: 900 })
  const peer = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const clients = [page, peer]
  const choice = '[data-pick="monkey-love-lab"]'
  const paper = '[data-sticker="monkey-love-lab"]'
  try {
    // Hold outbound gestures until both visitors have picked and dropped on their own canvas.
    let racing = true
    const pending: (() => void)[] = []
    for (const client of clients) {
      await client.routeWebSocket('**/_live-cursors-ws', (socket) => {
        const server = socket.connectToServer()
        socket.onMessage((message) => {
          if (racing && typeof message === 'string' && JSON.parse(message).type === 'board-action') {
            pending.push(() => server.send(message))
          } else {
            server.send(message)
          }
        })
      })
    }
    await Promise.all(clients.map(async (client, index) => {
      await client.goto('/en')
      await expect(client.locator('[data-board-ready="true"]')).toBeVisible({ timeout: 30000 })
      await client.locator('.sheet-toggle').click()
      await client.locator(choice).click()
      await expect(client.locator(paper)).toHaveClass(/is-lifted/)
      await client.mouse.click(750 + 120 * index, 400)
    }))
    racing = false
    for (const deliver of pending) {
      deliver()
    }
    for (const client of clients) {
      await expect(client.locator(choice)).toHaveAttribute('aria-pressed', 'true')
      await expect(client.locator(paper)).toHaveCount(1)
      await expect(client.locator(paper)).not.toHaveClass(/is-lifted/)
    }
    const winner = await peer.locator(paper).getAttribute('style')
    await expect(page.locator(paper)).toHaveAttribute('style', winner!)
    await page.reload()
    await expect(page.locator(paper)).toHaveAttribute('style', winner!)
    await expect(page.locator('[data-board-ready="true"]')).toBeVisible()
    await page.locator('.sheet-toggle').click()
    await page.getByRole('button', { name: 'Love chemistry is on the board. Click to return it to the sheet.' }).click()
    for (const client of clients) {
      await expect(client.locator(paper)).toHaveCount(0)
      await expect(client.locator(choice)).toHaveAttribute('aria-pressed', 'false')
    }
    await page.locator(choice).click()
    await page.mouse.click(750, 400)
    await expect(peer.locator(choice)).toHaveAttribute('aria-pressed', 'true')
    await page.mouse.move(750, 400)
    await page.mouse.down()
    await page.mouse.move(700, 450, { steps: 6 })
    const tray = page.locator('#sticker-sheet')
    const target = (await tray.boundingBox())!
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 10 })
    await expect(tray).toHaveClass(/is-drop-target/)
    await page.mouse.up()
    for (const client of clients) {
      await expect(client.locator(choice)).toHaveAttribute('aria-pressed', 'false')
      await expect(client.locator(paper)).toHaveCount(0)
      await client.reload()
      await expect(client.locator('[data-board-ready="true"]')).toBeVisible()
      await expect(client.locator(paper)).toHaveCount(0)
    }
  } finally {
    await peer.close()
  }
})
