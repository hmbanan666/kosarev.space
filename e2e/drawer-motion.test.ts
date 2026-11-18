import type { Locator } from '@playwright/test'
import { expect, test } from '@playwright/test'

async function observeClosing(panel: Locator) {
  // Capture the exit state atomically, before the 240ms transition can finish.
  return panel.evaluateHandle((element) => {
    const snapshots: { open: boolean, overflow: string, title: string | undefined }[] = []
    const observer = new MutationObserver(() => {
      if (element.getAttribute('data-state') !== 'closing') {
        return
      }
      snapshots.push({
        open: element.hasAttribute('open'),
        overflow: getComputedStyle(document.body).overflow,
        title: element.querySelector('h2')?.textContent?.trim(),
      })
      observer.disconnect()
    })
    observer.observe(element, { attributes: true, attributeFilter: ['data-state'] })
    return snapshots
  })
}

for (const width of [1280, 390]) {
  test(`shared drawer geometry, dismissal and focus at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/en?card=live')
    const card = page.locator('#activity-detail-panel')
    await expect(card).toHaveAttribute('data-state', 'open', { timeout: 20000 })
    await expect(card).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
    await expect(card).toHaveCSS('transition-duration', '0.24s')
    const geometry = await card.boundingBox()
    const backdrop = await card.evaluate((element) => {
      const style = getComputedStyle(element, '::backdrop')
      return [style.backgroundColor, style.backdropFilter, style.opacity]
    })
    for (const method of ['button', 'escape', 'backdrop']) {
      if (method !== 'button') {
        const opener = page.locator('[data-block="live"] .canvas-open')
        await opener.focus()
        await opener.press('Enter')
        await expect(card).toHaveAttribute('data-state', 'open')
        await expect(card).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
      }
      const closing = await observeClosing(card)
      if (method === 'button') {
        await card.getByRole('button', { name: 'Close details' }).click()
      } else if (method === 'escape') {
        await page.keyboard.press('Escape')
        await page.keyboard.press('Escape')
      } else {
        await page.mouse.click(10, 10)
      }
      await expect(card).not.toBeVisible()
      expect(await closing.jsonValue()).toEqual([{ open: true, overflow: 'hidden', title: 'Live cursors' }])
      await closing.dispose()
      await expect(card).toHaveAttribute('data-state', 'closed')
      // Typed OM preserves percentages when the closed dialog has no layout box.
      expect(await card.evaluate((element) => element.computedStyleMap().get('transform')?.toString()))
        .toBe(width < 768 ? 'translate(0px, 100%)' : 'translate(100%, 0px)')
    }
    const launcher = page.locator(width === 390 ? '.site-agent-trigger' : '.site-agent-launcher')
    await launcher.click()
    const agent = page.locator('.site-agent')
    await expect(agent).toHaveClass(/site-drawer/)
    await expect(agent).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
    expect(await agent.boundingBox()).toEqual(geometry)
    expect(await agent.evaluate((element) => {
      const style = getComputedStyle(element, '::backdrop')
      return [style.backgroundColor, style.backdropFilter, style.opacity]
    })).toEqual(backdrop)
    await expect(agent.locator('textarea')).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(agent).toHaveAttribute('data-state', 'closing')
    await expect(agent).not.toBeVisible()
    await expect(launcher).toBeFocused()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  })
}

for (const width of [1280, 390]) {
  test(`reduced motion keeps rendering and both drawers usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/en?card=live')
    const panel = page.locator('#activity-detail-panel')
    await expect(panel).toHaveAttribute('data-state', 'open', { timeout: 20000 })
    await expect(panel).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
    await page.keyboard.press('Escape')
    await expect(panel).not.toBeVisible()
    await expect(panel).toHaveAttribute('data-state', 'closed')
    await expect(panel).not.toHaveAttribute('open')
    await expect(page).toHaveURL('/en')
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    // A closed dialog alone does not prove that the renderer is still producing frames.
    expect(await page.evaluate(() => new Promise<boolean>((resolve) => {
      const timeout = setTimeout(resolve, 1000, false)
      requestAnimationFrame(() => {
        clearTimeout(timeout)
        resolve(true)
      })
    }))).toBe(true)
    await expect(panel).toHaveCSS('transition-duration', '0s')
    const launcher = page.locator(width === 390 ? '.site-agent-trigger' : '.site-agent-launcher')
    await launcher.click()
    const agent = page.locator('.site-agent')
    await expect(agent).toHaveAttribute('data-state', 'open')
    await expect(agent).toHaveCSS('transition-duration', '0s')
    await expect(agent).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
    await expect(agent.locator('textarea')).toBeFocused()
    await agent.getByRole('button', { name: 'Close agent' }).click()
    await expect(agent).not.toBeVisible()
    await expect(agent).not.toHaveAttribute('open')
    await expect(launcher).toBeFocused()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  })
}

test('card focus returns after browser Back commits the dismissal', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/en')
  const card = page.locator('[data-block="context"] .canvas-open')
  await card.press('Enter')
  const panel = page.locator('#activity-detail-panel')
  await expect(panel).toHaveAttribute('data-state', 'open')
  const pending = await panel.evaluateHandle((dialog) => {
    const go = history.go.bind(history)
    return {
      modalAtBack: new Promise<boolean>((resolve) => {
        history.go = (delta) => {
          // Hold the browser traversal beyond the drawer's reduced-motion exit.
          setTimeout(() => {
            resolve((dialog as HTMLDialogElement).open)
            history.go = go
            go(delta)
          }, 100)
        }
      }),
    }
  })
  await page.keyboard.press('Escape')
  expect(await pending.evaluate((result) => result.modalAtBack)).toBe(true)
  await expect(page).toHaveURL(/\/en$/)
  await expect(panel).not.toBeVisible()
  await expect(card).toBeFocused()
})

test('reopening during exit cancels the pending close', async ({ page }) => {
  await page.goto('/en/contact')
  await page.locator('.site-agent-launcher').click()
  const panel = page.locator('.site-agent')
  await expect(panel).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  await page.keyboard.press('Escape')
  await expect(panel).toHaveAttribute('data-state', 'closing')
  await page.keyboard.press('Control+k')
  await expect(panel).toHaveAttribute('data-state', 'open')
  // Wait beyond the close fallback, then verify that the same modal remains usable.
  await page.waitForTimeout(350)
  await expect(panel).toBeVisible()
  await expect(panel.locator('textarea')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(panel).not.toBeVisible()
})

test('drawer remains usable without animation frames or transition events', async ({ page }) => {
  await page.goto('/en/contact')
  const launcher = page.locator('.site-agent-launcher')
  await launcher.focus()
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0
    document.addEventListener('transitionend', (event) => event.stopImmediatePropagation(), true)
    document.querySelector<HTMLButtonElement>('.site-agent-launcher')!.click()
  })
  const panel = page.locator('.site-agent')
  await expect(panel).toHaveAttribute('data-state', 'open')
  await page.keyboard.press('Escape')
  await expect(panel).toHaveAttribute('data-state', 'closed')
  await expect(panel).not.toHaveAttribute('open')
  await expect(launcher).toBeFocused()
})

for (const width of [1280, 390]) {
  test(`drawer bodies expose every month and language row at ${width}px`, async ({ page }) => {
    test.setTimeout(120000)
    const { default: snapshot } = await import('../apps/web-app/tests/fixtures/activity-snapshot.json', { with: { type: 'json' } })
    await page.setViewportSize({ width, height: 844 })
    await page.route('**/api/activity', (route) => route.fulfill({ json: snapshot }))
    for (const id of ['contributions', 'context', 'k39', 'space', 'woodlands', 'dostigus', 'meloteka', 'startodel', 'chatgame', 'nextorders']) {
      await page.goto(`/en?card=${id}`)
      const panel = page.locator('#activity-detail-panel')
      await expect(panel).toHaveAttribute('data-state', 'open', { timeout: 20000 })
      // The panel can open with the empty server snapshot before the fixture arrives.
      await expect(page.locator('[data-block="feed"] .activity-feed li')).toHaveCount(3)
      const body = panel.locator('.site-drawer-body')
      // Every child must be reachable inside the actual scrollport, with bottom breathing room.
      const rows = panel.locator('.contribution-months li, .drawer-languages > div')
      for (let index = 0; index < await rows.count(); index++) {
        const row = rows.nth(index)
        await row.scrollIntoViewIfNeeded()
        expect(await row.evaluate((row) => {
          const rect = row.getBoundingClientRect()
          const body = row.closest('.site-drawer-body')!.getBoundingClientRect()
          return rect.top >= body.top - 1 && rect.bottom <= body.bottom + 1
        }), `${id} row ${index}`).toBe(true)
      }
      await body.evaluate((el) => {
        el.scrollTop = el.scrollHeight
      })
      expect(await body.evaluate((el) => {
        const last = el.lastElementChild!.getBoundingClientRect()
        return el.getBoundingClientRect().bottom - last.bottom
      }), `${id} bottom padding`).toBeGreaterThanOrEqual(23)
      const stack = panel.locator('.drawer-stack')
      if (await stack.count()) {
        await expect(stack.locator('..').getByRole('heading', { name: 'Stack', exact: true })).toBeVisible()
      }
    }
  })
}
