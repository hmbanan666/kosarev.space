import type { Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import process from 'node:process'
import { expect, test } from '@playwright/test'
import snapshot from '../apps/web-app/tests/fixtures/activity-snapshot.json' with { type: 'json' }

async function capture(page: Page, name: string) {
  if (process.env.NAV_CANVAS_SCREENSHOTS) {
    await mkdir('docs/images/nav-canvas-2', { recursive: true })
    await page.screenshot({ path: `docs/images/nav-canvas-2/${name}.png`, animations: 'disabled' })
  }
}
for (const locale of ['en', 'ru']) {
  for (const width of [1440, 390]) {
    test.describe(`${locale} ${width}`, () => {
      test.use({ isMobile: width === 390, hasTouch: width === 390 })
      test('header, launcher, larger board and queued conversation', async ({ page }) => {
        const prefix = locale === 'en' ? '/en' : ''
        await page.setViewportSize({ width, height: 900 })
        await page.context().addCookies([{ name: 'i18n_redirected', value: locale, url: 'http://localhost:3333' }])
        await page.route('**/api/activity', (route) => route.fulfill({ json: snapshot }))
        await page.goto(prefix || '/')
        const launcher = page.locator('.site-agent-launcher')
        await expect(launcher).toHaveAccessibleName('AI Bot')
        await page.evaluate(() => document.fonts.ready)
        await page.addStyleTag({ content: '#nuxt-devtools-container { display:none!important }' })
        await expect(page.locator('.site-header .site-language')).toBeVisible()
        expect((await page.locator('.site-header-inner').boundingBox())!.height).toBe(width === 1440 ? 64 : 56)
        if (width === 1440) {
          const header = await page.locator('.site-header-inner').boundingBox()
          const button = await page.locator('.site-agent-trigger').boundingBox()
          expect(button!.x + button!.width).toBeCloseTo(header!.x + header!.width, 0)
          expect(header!.x).toBeCloseTo(width - button!.x - button!.width, 0)
          const chrome = await page.locator('.canvas-chrome').boundingBox()
          const floating = await launcher.boundingBox()
          expect(floating!.y + floating!.height).toBeLessThan(chrome!.y)
          const clipped = await page.locator('.canvas-viewport').evaluate((viewport) => {
            const frame = viewport.getBoundingClientRect()
            return [...viewport.querySelectorAll('[data-block]')].some((block) => {
              const rect = block.getBoundingClientRect()
              return rect.left < frame.right && rect.right > frame.right && rect.top < frame.bottom
            })
          })
          expect(clipped).toBe(true)
        }
        await capture(page, `home-${locale}-${width}`)
        if (width === 1440) {
          const card = page.locator('[data-block="context"]')
          const edge = card.locator('.canvas-edge-left')
          await page.mouse.move(0, 0)
          await expect(card.locator('.canvas-grip')).toHaveCSS('opacity', '0')
          await edge.hover()
          await expect(edge).toHaveCSS('cursor', 'grab')
          await expect(card.locator('.canvas-grip')).toHaveCSS('opacity', '1')
          await capture(page, `hover-${locale}-${width}`)
          await page.locator('.canvas-viewport').dispatchEvent('wheel', { deltaY: 1000, ctrlKey: true })
          await expect(page.locator('[data-canvas-world]')).toHaveCSS('transform', 'matrix(0.25, 0, 0, 0.25, 0, 0)')
          for (const id of ['dostigus', 'meloteka', 'startodel', 'chatgame', 'nextorders', 'publication']) {
            await expect(page.locator(`[data-block="${id}"]`)).toBeInViewport({ ratio: 1 })
          }
          expect(await page.locator('[data-block]').evaluateAll((blocks) => blocks.filter((block) => block.scrollHeight > block.clientHeight + 2 || block.scrollWidth > block.clientWidth + 2).map((block) => block.getAttribute('data-block')))).toEqual([])
          await capture(page, `zoom-out-${locale}-${width}`)
        }
        await page.goto(`${prefix}/contact`)
        await expect(launcher).toBeVisible()
        await page.addStyleTag({ content: '#nuxt-devtools-container { display:none!important }' })
        await capture(page, `inner-${locale}-${width}`)
        let release!: () => void
        const firstResponse = new Promise<void>((resolve) => {
          release = resolve
        })
        const questions: string[] = []
        await page.route('**/api/agent', async (route) => {
          questions.push(route.request().postDataJSON().messages.at(-1).content)
          if (questions.length === 1) {
            await firstResponse
          }
          await route.fulfill({ contentType: 'text/event-stream', body: 'data: {"type":"delta","text":"K39"}\n\ndata: {"type":"done"}\n\n' })
        })
        await launcher.click()
        await expect(launcher).toBeHidden()
        const input = page.locator('#site-agent-input')
        await input.fill(locale === 'en' ? 'What is K39?' : 'Что такое K39?')
        await input.press('Enter')
        await expect.poll(() => questions.length).toBe(1)
        await input.fill(locale === 'en' ? 'Where can I try it?' : 'Где можно попробовать?')
        await input.press('Enter')
        const pending = page.getByText(locale === 'en' ? 'Queued' : 'В очереди', { exact: true })
        await expect(pending).toBeVisible()
        expect(questions).toHaveLength(1)
        await expect(input).toBeEnabled()
        await capture(page, `queue-${locale}-${width}`)
        release()
        await expect(page.locator('.agent-markdown')).toHaveCount(2)
        await expect(pending).toHaveCount(0)
        await page.keyboard.press('Escape')
        await expect(launcher).toBeVisible()
        await expect(launcher).toBeFocused()
      })
    })
  }
}

test('every card edge drags, while body taps open details', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/en')
  await expect(page.locator('.home-canvas')).toHaveClass(/canvas-enabled/)
  const card = page.locator('[data-block="context"]')
  for (const side of ['top', 'right', 'bottom', 'left']) {
    const original = await card.getAttribute('style')
    const edge = card.locator(`.canvas-edge-${side}`)
    await edge.hover()
    const box = await edge.boundingBox()
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.down()
    await page.mouse.move(box!.x + box!.width / 2 + (side === 'right' ? -90 : 90), box!.y + box!.height / 2 + (side === 'bottom' ? -90 : 90), { steps: 6 })
    await expect(page.locator('.canvas-target')).toBeVisible()
    await expect(edge).toHaveCSS('cursor', 'grabbing')
    await page.mouse.up()
    await expect(card).not.toHaveAttribute('style', original!)
    await expect(page.getByRole('dialog')).toHaveCount(0)
  }
  await card.locator('.canvas-description').click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

test.describe('tablet touch', () => {
  test.use({ hasTouch: true, isMobile: true })
  test('edge movement does not steal body taps', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 })
    await page.goto('/en')
    await expect(page.locator('.home-canvas')).toHaveClass(/canvas-enabled/)
    const card = page.locator('[data-block="context"]')
    await card.locator('.canvas-description').tap()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    const original = await card.getAttribute('style')
    const edge = await card.locator('.canvas-edge-left').boundingBox()
    const touch = { x: edge!.x + edge!.width / 2, y: edge!.y + edge!.height / 2 }
    const client = await page.context().newCDPSession(page)
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch] })
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: touch.x + 90, y: touch.y + 90 }] })
    await expect(page.locator('.canvas-target')).toBeVisible()
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect(card).not.toHaveAttribute('style', original!)
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})
