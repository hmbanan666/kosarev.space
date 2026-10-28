import { expect, test } from '@playwright/test'
import { publishRevision, saveDraft } from '../packages/database/scripts/publication.mjs'
import { fixture, openTestDatabase, removeFixture } from './publication-fixture.mjs'

test('a reviewed database revision becomes visible without restarting the application', async ({ page, request }) => {
  const client = await openTestDatabase()
  const slug = 'dynamic-digest-fixture'
  try {
    await removeFixture(client, slug)
    const draft = { ...fixture, slug, type: 'digest', relatedWork: [] }
    const first = await saveDraft(client, draft)
    expect((await request.get(`/api/publications/${slug}`)).status()).toBe(404)
    expect((await request.get(`/writing/${slug}`)).status()).toBe(404)
    expect(await (await request.get('/api/publications')).text()).not.toContain(slug)
    expect(await (await request.get('/__sitemap')).text()).not.toContain(slug)
    await publishRevision(client, slug, first.revision, null)
    await page.goto(`/writing/${slug}`)
    await expect(page.locator('h1')).toHaveText(fixture.locales.ru.title)
    await expect(page.locator('.writing-label')).toContainText('Дайджест')
    const updated = structuredClone(draft)
    updated.locales.ru.title = 'Обновлённая редакция'
    updated.locales.en.title = 'Updated revision'
    updated.locales.ru.body = '<script>window.injected=true</script>\n\nНовый текст'
    const second = await saveDraft(client, updated)
    await page.reload()
    await expect(page.locator('h1')).toHaveText(fixture.locales.ru.title)
    await publishRevision(client, slug, second.revision, first.revision)
    await page.reload()
    await expect(page.locator('h1')).toHaveText(updated.locales.ru.title)
    await expect(page.locator('article script')).toHaveCount(0)
    await expect(page.locator('.writing-body')).toContainText('<script>window.injected=true</script>')
    await page.locator('.site-language').click()
    await expect(page.locator('h1')).toHaveText(updated.locales.en.title)
    expect(await (await request.get('/__sitemap')).text()).toContain(slug)
    await publishRevision(client, slug, first.revision, second.revision)
    await page.reload()
    await expect(page.locator('h1')).toHaveText(fixture.locales.en.title)
  } finally {
    await removeFixture(client, slug)
    await client.end()
  }
})

test('draft-only publications stay absent from public detail, list and sitemap', async ({ request }) => {
  for (const prefix of ['', '/en']) {
    expect((await request.get(`${prefix}/writing/unpublished-fixture`)).status()).toBe(404)
  }
  expect((await request.get('/api/publications/unpublished-fixture')).status()).toBe(404)
  expect(await (await request.get('/api/publications')).text()).not.toContain('unpublished-fixture')
  expect(await (await request.get('/__sitemap')).text()).not.toContain('unpublished-fixture')
})
