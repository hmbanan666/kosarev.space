import { expect, test } from '@playwright/test'
import content from '../packages/database/content/engineering-cases.json' with { type: 'json' }

for (const locale of ['ru', 'en']) {
  test(`featured cases stay discoverable through search, details and the full catalog (${locale})`, async ({ page }) => {
    const local = (path: string) => locale === 'en' ? `/en${path}` : path || '/'
    const records = content.map((item) => ({
      key: item.key,
      ...item.translations.find((translation) => translation.locale === locale)!,
      tags: item.create?.tags ?? ['Nuxt'],
      image: null,
      icon: 'i-lucide-code',
      stats: { views: 0, reactions: {} },
    })).reverse()
    await page.route(/\/api\/cases(?:\?.*)?$/, (route) => route.fulfill({ json: records }))
    await page.route(/\/api\/cases\/expi-billing(?:\?.*)?$/, (route) => route.fulfill({ json: { ...records.find((item) => item.key === 'expi-billing'), related: [] } }))
    await page.route(/\/api\/cases\/expi-billing\/view/, (route) => route.fulfill({ status: 204 }))
    await page.goto(local('/cv'))
    await expect(page.getByRole('button', { name: locale === 'en' ? 'Copy email address' : 'Скопировать email', exact: true })).toBeEnabled()
    await page.locator(`header a[href="${local('')}#skills"]`).first().click()
    await expect(page.locator('.case-preview')).toHaveCount(6)
    const first = page.locator('.case-preview').first()
    await expect(first.locator('h3 a')).toHaveAttribute('href', local('/cases/expi-billing'))
    await expect(page.locator('.case-preview').nth(1).locator('h3 a')).toHaveAttribute('href', local('/cases/o5-rewrite'))
    await expect(page.locator('.case-preview').nth(2).locator('.case-preview-status')).toBeVisible()

    await page.locator('.case-show-all').click()
    await expect(page.locator('.case-preview')).toHaveCount(records.length)
    await expect(page.locator('.case-preview').first().locator('h3 a')).toHaveAttribute('href', `${local(`/cases/${records[0]!.key}`)}?all=1`)
    await page.locator('input[name="q"]').fill(locale === 'en' ? 'billing' : 'биллинг')
    await page.locator('.case-filters button[type="submit"]').click()
    await expect(page.locator('.case-preview')).toHaveCount(1)
    await page.locator('.case-preview h3 a').click()
    await expect(page.locator('h1')).toContainText('EXPI')
    await page.locator('#case-details summary').click()
    await expect(page.locator('#case-details')).toHaveAttribute('open', '')
    await expect(page.locator('#case-details p')).toContainText(locale === 'en' ? 'transaction' : 'транзакции')
    expect(await page.locator('#case-details p').evaluate((element) => getComputedStyle(element).whiteSpace)).toBe('pre-line')
    await page.locator('.case-breadcrumb a').first().click()
    await expect(page.locator('input[name="q"]')).toHaveValue(locale === 'en' ? 'billing' : 'биллинг')
    await expect(page.locator('.case-preview')).toHaveCount(1)
  })
}
