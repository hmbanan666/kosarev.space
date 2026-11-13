import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

const en = JSON.parse(readFileSync(new URL('../apps/web-app/i18n/locales/en.json', import.meta.url), 'utf8'))
const ru = JSON.parse(readFileSync(new URL('../apps/web-app/i18n/locales/ru.json', import.meta.url), 'utf8'))

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
  test(`project pages describe Context and paused Dostigus (${locale})`, async ({ page, request }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(`${prefix}/projects/context`)
    await expect(page.locator('h1')).toHaveText('Context')
    await expect(page.locator('[data-project-status="active"]')).toHaveText(locale === 'en' ? 'Active' : 'В работе')
    const contextArticle = page.locator('article')
    await expect(contextArticle).toContainText(locale === 'en'
      ? 'On 60 synthetic notes, 10 of 12 questions got complete answers.'
      : '10 из 12 вопросов получили полные ответы')
    await expect(contextArticle).not.toContainText(locale === 'en' ? '3 of 12' : '3 из 12')
    await expect(contextArticle).toContainText('Keycloak')
    await expect(contextArticle).not.toContainText('EXPI')
    await expect(page.locator('[data-project-sections]')).toBeVisible()
    for (const heading of Object.values((locale === 'en' ? en : ru).projects.sections)) {
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    }
    const contextRepo = page.locator('a[href="https://github.com/hmbanan666/context"]')
    await expect(contextRepo).toHaveCount(2)
    await expect(contextRepo.first()).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(contextRepo.nth(1)).toHaveAttribute('rel', 'noopener noreferrer')
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
    const dostigusArticle = page.locator('article')
    await expect(dostigusArticle).toContainText(locale === 'en' ? 'Development is paused' : 'Разработка на паузе')
    await expect(dostigusArticle).not.toContainText(locale === 'en' ? 'dead end' : 'тупик')
    await expect(dostigusArticle).not.toContainText(locale === 'en' ? 'later used the same' : 'затем использовал')
    await expect(dostigusArticle).toContainText('Mailer')
    await expect(dostigusArticle).toContainText('@nuxtjs/mcp-toolkit')
    await expect(page.locator('[data-project-sections]')).toBeVisible()
    const dostigusRepo = page.locator('a[href="https://github.com/dostigus/dostigus"]')
    await expect(dostigusRepo).toHaveCount(2)
    const dostigusHtml = await (await request.get(`${prefix}/projects/dostigus`)).text()
    expect(dostigusHtml).toContain('@nuxtjs/mcp-toolkit')
    expect(dostigusHtml).not.toContain('{\'@\'}')
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
  for (const path of ['/og/en/home.png', '/og/ru/projects/context.png', '/og/ru/projects/k39.png', '/og/en/projects/k39.png', '/og/en/writing/k39-draft-permissions.png']) {
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
  const k39 = list.itemListElement.find((entry: { item: { name: string } }) => entry.item.name === 'K39').item
  expect(k39.url).toBe('https://kosarev.space/en/projects/k39')
  expect(k39.sameAs).toBe('https://k39.online')
  expect(k39.description).toBe(en.projects.k39.description)
})

test('sitemap lists project pages and writing feeds', async ({ request }) => {
  const source = await (await request.get('/__sitemap')).text()
  expect(source).toContain('/projects/context')
  expect(source).toContain('/projects/k39')
  expect(source).not.toContain('section-fixture')
  expect(source).toContain('/writing/feed.xml')
  const index = await (await request.get('/sitemap_index.xml')).text()
  const locs = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!)
  expect(locs.length).toBeGreaterThan(0)
  let combined = ''
  for (const loc of locs) {
    combined += await (await request.get(new URL(loc!).pathname)).text()
  }
  expect(combined).toContain('/projects/context')
  expect(combined).toContain('/projects/k39')
  expect(combined).toContain('/en/projects/k39')
  expect(combined).toContain('/en/projects/dostigus')
  expect(combined).not.toContain('/projects/section-fixture')
  expect(combined).toContain('/writing/feed.xml')
  expect(combined).toContain('/en/writing/feed.xml')
})

for (const locale of ['ru', 'en'] as const) {
  const prefix = locale === 'en' ? '/en' : ''
  const messages = locale === 'en' ? en : ru

  test(`k39 project page keeps the short description and public link (${locale})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(`${prefix}/projects/k39`)
    await expect(page.locator('h1')).toHaveText('K39')
    await expect(page.locator('[data-project-status="active"]')).toHaveText(messages.projects.statusActive)
    await expect(page.locator('.project-kind')).toHaveText(messages.projects.k39.kind)
    await expect(page.locator('.project-deck')).toHaveText(messages.projects.k39.description)
    await expect(page.locator('.project-work')).toHaveText(messages.projects.k39.work)
    await expect(page.getByRole('link', { name: messages.projects.k39.visit })).toHaveAttribute('href', 'https://k39.online')
    const k39Repo = page.locator('a[href="https://github.com/hmbanan666/k39"]')
    await expect(k39Repo).toHaveCount(2)
    await expect(k39Repo.first()).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(page.locator('[data-project-sections]')).toBeVisible()
    for (const heading of Object.values(messages.projects.sections)) {
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    }
    await expect(page.locator('#project-status-next')).toContainText(locale === 'en'
      ? 'test whether the site can earn money'
      : 'может ли сайт зарабатывать')
    await expect(page.locator('article')).not.toContainText('EXPI')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://kosarev.space${prefix}/projects/k39`)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `https://kosarev.space/og/${locale}/projects/k39.png`)
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', messages.projects.k39.description)
    const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)
    expect(data['@type']).toBe('SoftwareSourceCode')
    expect(data.name).toBe('K39')
    expect(data.url).toBe(`https://kosarev.space${prefix}/projects/k39`)
    expect(data.sameAs).toBe('https://k39.online')
    expect(data.codeRepository).toBe('https://github.com/hmbanan666/k39')
    expect(data.description).toBe(messages.projects.k39.description)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.locator('h1')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.getByRole('link', { name: locale === 'en' ? 'Русский' : 'English', exact: true }).click()
    await expect(page).toHaveURL(locale === 'en' ? /:\/\/[^/]+\/projects\/k39$/ : /\/en\/projects\/k39$/)
    await expect(page.locator('.project-deck')).toHaveText(locale === 'en' ? ru.projects.k39.description : en.projects.k39.description)
    await expect(page.locator('#project-problem')).toContainText(locale === 'en' ? 'Туристу нужно понять' : 'A visitor needs to know')
  })

  test(`section fixture shows every long-form block (${locale})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(`${prefix}/projects/section-fixture`)
    const article = page.locator('[data-project-fixture]')
    await expect(article.locator('h1')).toHaveText(locale === 'en' ? 'Sample project' : 'Образец проекта')
    await expect(article.locator('[data-project-sections]')).toBeVisible()
    for (const heading of Object.values(messages.projects.sections)) {
      await expect(article.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    }
    await expect(article).toContainText(locale === 'en' ? 'One reason per decision' : 'Одна причина на решение')
    await expect(article).toContainText(locale === 'en' ? 'Sample markup' : 'Образец разметки')
    await expect(article.locator('a[href="https://example.com/fixture"]')).toHaveCount(2)
    await expect(article).not.toContainText('K39')
    await expect(article).not.toContainText('Context')
    await expect(article).not.toContainText('Dostigus')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    await page.setViewportSize({ width: 390, height: 844 })
    await expect(article.locator('#project-decisions')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
}

test('k39 project page is readable without javascript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/projects/k39')
  await expect(page.locator('h1')).toHaveText('K39')
  await expect(page.locator('a[href="https://k39.online"]').first()).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(page.locator('[data-project-sections]')).toBeVisible()
  await expect(page.locator('#project-problem')).toContainText('Туристу нужно понять, куда пускают')
  await context.close()
})
