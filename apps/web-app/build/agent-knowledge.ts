import type { KnowledgeChunk } from '../server/agent/knowledge'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import cases from '../../../packages/database/content/engineering-cases.json'
import { cvRoles, cvSkillGroups } from '../app/utils/cv'
import { activeProducts, closedProjectYears, pausedProjects, projects } from '../app/utils/data'
import en from '../i18n/locales/en.json'
import ru from '../i18n/locales/ru.json'
import pro from '../public/pro.json'
import { chunkDocument } from '../server/agent/knowledge'

export function textOf(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }
  if (Array.isArray(value)) {
    return value.map(textOf).join('\n')
  }
  return value && typeof value === 'object' ? Object.entries(value).map(([key, item]) => `${key}: ${textOf(item)}`).join('\n') : ''
}

export function publicKnowledge(): KnowledgeChunk[] {
  const result: KnowledgeChunk[] = []
  for (const [locale, copy] of Object.entries({ ru, en })) {
    const prefix = locale === 'en' ? '/en' : ''
    const add = (title: string, path: string, value: unknown) => result.push(...chunkDocument(title, `${prefix}${path}`, locale, textOf(value)))
    add('Nikolay Kosarev · Николай Косарев', '/', [copy.hero, copy.cv.summary])
    add('Skills · Stack · Навыки · Стек', '/cv#cv-skills', cvSkillGroups)
    add('Career summary · Опыт работы', '/cv', [copy.cv.summary, cvRoles.map(({ period, stack }) => ({ period, stack }))])
    add('CV · Experience · Опыт · Стек', '/cv', [copy.cv, cvRoles, cvSkillGroups])
    add('Contact · Контакты', '/contact', [copy.contacts, 'nick@kosarev.space', 'https://t.me/hmbanan666'])
    for (const product of [...activeProducts, ...pausedProjects, ...projects]) {
      const page = 'page' in product ? product.page : undefined
      add(product.title, page ?? `/projects#project-${product.key}`, [product, copy.projects[product.key as keyof typeof copy.projects], closedProjectYears[product.key] ? `Closed in ${closedProjectYears[product.key]}` : ''])
    }
    for (const item of cases) {
      const translation = item.translations.find((entry) => entry.locale === locale)!
      add(translation.title, `/cases/${item.key}`, translation)
    }
    add('Professional profile · Профессиональный профиль', '/pro.json', pro)
  }
  // pro.json has one public URL, regardless of interface locale.
  return result.map((chunk) => chunk.url === '/en/pro.json' ? { ...chunk, url: '/pro.json' } : chunk)
}

export async function generateAgentKnowledge() {
  const directory = fileURLToPath(new URL('../.nuxt/agent-knowledge/', import.meta.url))
  await mkdir(directory, { recursive: true })
  await writeFile(`${directory}pack.json`, JSON.stringify(publicKnowledge()))
}
