import { expect, test } from '@playwright/test'

test('homepage renders all sections', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#projects')).toBeVisible()
  await expect(page.locator('#skills')).toBeVisible()
  await expect(page.locator('#contacts')).toBeVisible()
})

test('has correct page title', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Косарев|Kosarev/)
})

test('navigation to projects works', async ({ page }) => {
  await page.goto('/')

  await page.locator('a[href="#projects"]').first().click()
  await expect(page.locator('#projects')).toBeInViewport()
})

test('language switcher is visible', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('button', { hasText: /English|Русский/ })).toBeVisible({ timeout: 10000 })
})
