import { expect, test } from '@playwright/test'

for (const width of [1280, 390]) {
  test(`shared drawer geometry, dismissal and focus at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/en?card=live')
    const card = page.locator('#activity-detail-panel')
    await expect(card).toHaveAttribute('data-state', 'open')
    await expect(card).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
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
        await expect(card).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
      }
      if (method === 'button') {
        await card.getByRole('button', { name: 'Close details' }).click()
      } else if (method === 'escape') {
        await page.keyboard.press('Escape')
        await page.keyboard.press('Escape')
      } else {
        await page.mouse.click(10, 10)
      }
      await expect(card).toHaveAttribute('data-state', 'closing')
      await expect(card).toHaveAttribute('open', '')
      await expect(card.locator('h2')).toHaveText('Live cursors')
      await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
      await expect(card).not.toBeVisible()
      await expect(card).toHaveAttribute('data-state', 'closed')
    }
    const launcher = page.locator('.site-agent-launcher')
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

test('reduced motion disables the slide and still closes the modal', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/en?card=live')
  const panel = page.locator('#activity-detail-panel')
  await expect(panel).toBeVisible({ timeout: 20000 })
  expect(await panel.evaluate((el) => Number.parseFloat(getComputedStyle(el).transitionDuration))).toBeLessThan(0.001)
  await expect(panel).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  await page.keyboard.press('Escape')
  await expect(panel).not.toBeVisible()
  // Keyboard activation also works when headless Chromium stops delivering frames
  // after an instant dismissal; pointer activation is covered above at both widths.
  await page.locator('.site-agent-launcher').focus()
  await page.keyboard.press('Enter')
  const agent = page.locator('.site-agent')
  await expect(agent).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  await expect(agent).toHaveAttribute('data-state', 'open')
  await agent.getByRole('button', { name: 'Close agent' }).press('Enter')
  await expect(agent).not.toBeVisible()
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
