import { expect, test } from './board-fixture'

test('pick, place and return a sticker with the keyboard across visits', { tag: '@board-write' }, async ({ page }) => {
  await page.goto('/en')
  const tray = page.getByRole('button', { name: 'Stickers', exact: true })
  await tray.click()
  const sheet = page.getByRole('group', { name: 'Sticker sheet' })
  const drawings = sheet.locator('img')
  await expect(drawings).toHaveCount(9)
  const sources = await drawings.evaluateAll(async (images) => {
    await Promise.all(images.map((image) => image.decode()))
    return images.map((image) => image.currentSrc)
  })
  expect(new Set(sources).size).toBe(9)
  const choice = sheet.getByRole('button', { name: 'Pick up Love chemistry' })
  await expect(choice).toHaveText('')
  await choice.press('Enter')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  const sticker = page.getByRole('group', { name: 'Stickers', exact: true }).getByRole('button', { name: 'Move Love chemistry' })
  await expect(sticker).toBeVisible()
  await expect(sticker).toHaveClass(/is-landed/)
  const placed = await sticker.getAttribute('style')
  await page.reload()
  await tray.click()
  await expect(sticker).toHaveAttribute('style', placed!)
  await sticker.press('Enter')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(sticker).not.toHaveAttribute('style', placed!)
  await sticker.press('Enter')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Return to sheet' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(sticker).toHaveCount(0)
  await page.reload()
  await tray.click()
  await expect(sheet.getByRole('button', { name: 'Pick up Love chemistry' })).toBeVisible()
})

test('stickers follow the world through zoom and pan, and release the card underneath', { tag: '@board-write' }, async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/en')
  const tray = page.getByRole('button', { name: 'Stickers', exact: true })
  const viewport = page.locator('.canvas-viewport')
  const hero = page.locator('[data-block="hero"]')
  await expect(tray).toHaveAttribute('aria-expanded', 'false')
  const idea = page.locator('[data-sticker="monkey-bright-idea"]')
  const travel = idea.locator('.paper-travel')
  await expect(travel).toHaveCSS('transform', 'none')
  const original = await idea.getAttribute('style')
  const start = (await idea.boundingBox())!
  const card = (await hero.boundingBox())!
  const destination = { x: card.x + card.width * 0.7, y: card.y + card.height * 0.28 }
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  await expect(idea).toHaveClass(/is-peeling/)
  await expect(idea).not.toHaveClass(/is-lifted/)
  await page.mouse.move(destination.x, destination.y, { steps: 6 })
  await expect(idea).toHaveClass(/is-lifted/)
  await expect(idea.locator('.paper-corner')).not.toHaveCSS('transform', 'none')
  await expect(travel).not.toHaveCSS('transform', 'none')
  await page.mouse.up()
  await expect(idea).toHaveClass(/is-landed/)
  expect(await idea.locator('.paper').evaluate((paper) => {
    const animation = paper.getAnimations().find((a) => a instanceof CSSAnimation)
    if (!animation) {
      return false
    }
    animation.pause()
    animation.currentTime = Number(animation.effect!.getTiming().duration) * 0.35
    const matrix = new DOMMatrix(getComputedStyle(paper).transform)
    animation.play()
    return matrix.a < 1 && matrix.d < matrix.a
  })).toBe(true)
  await expect(travel).toHaveCSS('transform', 'none')
  await expect(tray).toHaveAttribute('aria-expanded', 'false')
  await expect(idea).not.toHaveAttribute('style', original!)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const overlap = () => idea.evaluate((el) => {
    const decal = el.getBoundingClientRect()
    const card = document.querySelector('[data-block="hero"]')!.getBoundingClientRect()
    return Math.abs((decal.x + decal.width / 2 - card.x) / card.width - 0.7) < 0.03
      && Math.abs((decal.y + decal.height / 2 - card.y) / card.height - 0.28) < 0.03
  })
  await expect.poll(overlap).toBe(true)
  const world = page.locator('[data-canvas-world]')
  const transform = await world.evaluate((el) => getComputedStyle(el).transform)
  await viewport.dispatchEvent('wheel', { deltaY: -160, ctrlKey: true })
  await expect.poll(() => world.evaluate((el) => getComputedStyle(el).transform)).not.toBe(transform)
  await viewport.focus()
  await viewport.press('ArrowRight')
  await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
  await expect.poll(overlap).toBe(true)
  await idea.scrollIntoViewIfNeeded()
  const rect = (await idea.boundingBox())!
  const stuck = await idea.getAttribute('style')
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2)
  await page.mouse.down()
  await page.mouse.move(rect.x + rect.width, rect.y)
  await expect(idea).toHaveClass(/is-lifted/)
  await page.keyboard.press('Escape')
  await page.mouse.up()
  await expect(idea).toHaveAttribute('style', stuck!)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2)
  await expect(page).toHaveURL(/card=hero/)
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await tray.click()
  await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2)
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)

  const grip = hero.locator('.canvas-grip')
  await grip.scrollIntoViewIfNeeded()
  const handle = (await grip.boundingBox())!
  await tray.click()
  await page.getByRole('button', { name: 'Pick up Hooded hacker' }).click()
  await page.mouse.click(handle.x + handle.width / 2, handle.y + handle.height / 2)
  await expect(tray).toHaveAttribute('aria-expanded', 'true')
  await tray.click()
  const hacker = page.locator('[data-sticker="monkey-skull-laptop"]')
  const onGrip = (await hacker.boundingBox())!
  expect(Math.abs(onGrip.x + onGrip.width / 2 - handle.x - handle.width / 2)).toBeLessThan(handle.width / 2)
  expect(Math.abs(onGrip.y + onGrip.height / 2 - handle.y - handle.height / 2)).toBeLessThan(handle.height / 2)
  const decalPosition = await hacker.getAttribute('style')
  const before = await hero.getAttribute('style')
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
  await page.mouse.down()
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height * 5, { steps: 8 })
  await expect(page.locator('.canvas-target')).toBeVisible()
  await page.mouse.up()
  await expect(hero).not.toHaveAttribute('style', before!)
  await expect(hacker).toHaveAttribute('style', decalPosition!)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('placing by click and cancelling a lift preserve the sheet on mobile', { tag: '@board-write' }, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/en')
  await page.getByRole('button', { name: 'Stickers', exact: true }).click()
  const sheet = page.getByRole('group', { name: 'Sticker sheet' })
  await sheet.getByRole('button', { name: 'Pick up Laptop panic' }).click()
  const card = (await page.locator('[data-block="contributions"]').boundingBox())!
  await page.mouse.click(card.x + card.width / 2, card.y + card.height / 2)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const item = page.getByRole('group', { name: 'Stickers', exact: true }).getByRole('button', { name: 'Move Laptop panic' })
  const before = await item.getAttribute('style')
  await item.press('Enter')
  await expect(item).toHaveClass(/is-lifted/)
  await expect(item.locator('.paper-corner')).toHaveCSS('transform', 'none')
  await expect(item.locator('.paper-travel')).toHaveCSS('transform', 'none')
  await expect(item.locator('.paper')).toHaveCSS('transform', 'none')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Escape')
  await expect(item).toHaveAttribute('style', before!)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('button', { name: 'Stickers', exact: true })).toHaveCount(0)
  const collection = page.getByRole('group', { name: 'Stickers' })
  await expect(collection.getByRole('img', { name: 'Laptop panic' })).toBeVisible()
  await expect(collection.getByRole('img')).toHaveCount(3)
})

test('release follows the current viewport when a scroll and drop share a frame', { tag: '@board-write' }, async ({ page }) => {
  // Scroll in the same input turn, before the browser delivers its next scroll event.
  await page.addInitScript(() => {
    window.addEventListener('pointerup', () => {
      if (document.querySelector('.sticker.is-lifted')) {
        document.querySelector('.canvas-viewport')?.scrollBy({ left: 180, behavior: 'instant' })
      }
    }, { capture: true })
  })
  await page.goto('/en')
  await page.locator('.sheet-toggle').click()
  await page.locator('[data-pick="monkey-laptop-panic"]').click()
  const view = (await page.locator('.canvas-viewport').boundingBox())!
  const x = view.x + view.width / 2
  const y = view.y + view.height / 2
  await page.mouse.click(x, y)
  await expect(page.locator('.sticker.is-lifted')).toHaveCount(0)
  const paper = (await page.locator('[data-sticker="monkey-laptop-panic"]').boundingBox())!
  expect(Math.abs(x - paper.x - paper.width / 2)).toBeLessThan(paper.width / 4)
  expect(Math.abs(y - paper.y - paper.height / 2)).toBeLessThan(paper.height / 4)
})
