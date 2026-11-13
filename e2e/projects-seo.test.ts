import { expect, test } from '@playwright/test'

test('writing feeds are valid RSS in both locales and stay out of draft content', async ({ request }) => {
  for (const [path, title, link] of [
    ['/writing/feed.xml', 'Тестовая публикация', 'https://kosarev.space/writing/k39-draft-permissions'],
    ['/en/writing/feed.xml', 'Fixture publication', 'https://kosarev.space/en/writing/k39-draft-permissions'],
  ] as const) {
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('xml')
    const body = await response.text()
    expect(body.startsWith('<?xml')).toBe(true)
    expect(body).toContain('<rss version="2.0"')
    expect(body).toContain('<channel>')
    expect(body).toContain(path.startsWith('/en') ? '<title>Writing by Nick Kosarev</title>' : '<title>Публикации Николая Косарева</title>')
    expect(body).toContain(`<title>${title}</title>`)
    expect(body).toContain(`<link>${link}</link>`)
    expect(body).toContain(`<guid isPermaLink="true">${link}</guid>`)
    expect(body).toContain('<pubDate>Wed, 28 Oct 2026 00:00:00 GMT</pubDate>')
    expect(body).not.toContain('unpublished-fixture')
  }
})

test('writing pages advertise both feeds', async ({ page }) => {
  await page.goto('/writing')
  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"][href="https://kosarev.space/writing/feed.xml"]')).toHaveAttribute('title', 'Публикации Николая Косарева')
  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"][href="https://kosarev.space/en/writing/feed.xml"]')).toHaveAttribute('title', 'Writing by Nick Kosarev')
  await page.goto('/writing/k39-draft-permissions')
  const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)
  expect(data['@type']).toBe('Article')
  expect(data.image).toBe('https://kosarev.space/og/ru/writing/k39-draft-permissions.png')
})

for (const locale of ['ru', 'en'] as const) {
  const prefix = locale === 'en' ? '/en' : ''
  test(`project pages describe Context and paused Dostigus (${locale})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(`${prefix}/projects/context`)
    await expect(page.locator('h1')).toHaveText('Context')
    await expect(page.locator('[data-project-status="active"]')).toHaveText(locale === 'en' ? 'Active' : 'В работе')
    await expect(page.locator('article')).toContainText(locale === 'en'
      ? 'On 60 synthetic notes, 10 of 12 questions got complete answers.'
      : '10 из 12 вопросов получили полные ответы')
    await expect(page.locator('a[href="https://github.com/hmbanan666/context"]')).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://kosarev.space${prefix}/projects/context`)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `https://kosarev.space/og/${locale}/projects/context.png`)
    const contextData = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)
    expect(contextData['@type']).toBe('SoftwareSourceCode')
    expect(contextData.codeRepository).toBe('https://github.com/hmbanan666/context')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${prefix}/projects/dostigus`)
    await expect(page.locator('h1')).toHaveText('Dostigus')
    await expect(page.locator('[data-project-status="paused"]')).toHaveText(locale === 'en' ? 'Paused' : 'На паузе')
    await expect(page.locator('a[href="https://github.com/dostigus/dostigus"]')).toBeVisible()
    await expect(page.locator('a[href="https://dostigus.ru"]')).toHaveCount(0)
    const pausedData = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)
    expect(pausedData['@type']).toBe('SoftwareSourceCode')
    expect(pausedData.codeRepository).toBe('https://github.com/dostigus/dostigus')
    expect(pausedData.description.startsWith(locale === 'en' ? 'Paused.' : 'На паузе.')).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
}

test('unknown project and generated images respond correctly', async ({ request }) => {
  expect((await request.get('/projects/missing')).status()).toBe(404)
  expect((await request.get('/og/en/projects/missing.png')).status()).toBe(404)
  for (const path of ['/og/en/home.png', '/og/ru/projects/context.png', '/og/en/writing/k39-draft-permissions.png']) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
    expect(response.headers()['content-type']).toContain('image/png')
    expect((await response.body()).subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
  }
})

test('homepage structured data keeps the person first and describes projects', async ({ page }) => {
  await page.goto('/en')
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(JSON.parse(scripts[0]!)['@type']).toBe('Person')
  const list = JSON.parse(scripts[1]!)
  expect(list['@type']).toBe('ItemList')
  expect(list.itemListElement[0].item.name).toBe('Context')
  expect(list.itemListElement.find((entry: { item: { name: string } }) => entry.item.name === 'Woodlands').item.codeRepository).toBeUndefined()
})

test('sitemap lists project pages and writing feeds', async ({ request }) => {
  const source = await (await request.get('/__sitemap')).text()
  expect(source).toContain('/projects/context')
  expect(source).toContain('/writing/feed.xml')
  const index = await (await request.get('/sitemap_index.xml')).text()
  const locs = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!)
  expect(locs.length).toBeGreaterThan(0)
  let combined = ''
  for (const loc of locs) {
    combined += await (await request.get(new URL(loc!).pathname)).text()
  }
  expect(combined).toContain('/projects/context')
  expect(combined).toContain('/en/projects/dostigus')
  expect(combined).toContain('/writing/feed.xml')
  expect(combined).toContain('/en/writing/feed.xml')
})
