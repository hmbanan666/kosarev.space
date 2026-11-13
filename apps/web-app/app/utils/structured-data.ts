import type { ActiveProduct, PausedProject, Project } from './data'
import { activeProducts, closedProjectYears, pausedProjects, projects } from './data'

type Locale = 'ru' | 'en'
type Translate = (key: string, params?: Record<string, unknown>) => string

export interface ProjectEntity {
  '@type': 'SoftwareSourceCode' | 'CreativeWork'
  'name': string
  'description': string
  'url': string
  'codeRepository'?: string
  'programmingLanguage'?: string
  'license'?: string
  'author': { '@type': 'Person', 'name': string, 'url': string }
}

function localeUrl(locale: Locale, path: string): string {
  const suffix = path === '/' ? '' : path
  return locale === 'en' ? `https://kosarev.space/en${suffix}` : `https://kosarev.space${suffix}`
}

function entity(input: {
  name: string
  description: string
  url: string
  codeRepository?: string
  programmingLanguage?: string
  license?: string
  authorName: string
}): ProjectEntity {
  return {
    '@type': input.codeRepository ? 'SoftwareSourceCode' : 'CreativeWork',
    'name': input.name,
    'description': input.description,
    'url': input.url,
    ...(input.codeRepository ? { codeRepository: input.codeRepository } : {}),
    ...(input.programmingLanguage ? { programmingLanguage: input.programmingLanguage } : {}),
    ...(input.license ? { license: input.license } : {}),
    'author': { '@type': 'Person', 'name': input.authorName, 'url': 'https://kosarev.space' },
  }
}

function descriptionFor(t: Translate, key: string, paused = false): string {
  const description = t(`projects.${key}.description`)
  const closedYear = closedProjectYears[key]
  const prefix = paused
    ? `${t('projects.statusPaused')}. `
    : closedYear
      ? `${t('projects.closed', { year: closedYear })}. `
      : ''
  return `${prefix}${description}`
}

function orderedArchive(): Project[] {
  return [...projects].sort((a, b) => Number(b.key === 'nextorders') - Number(a.key === 'nextorders'))
}

export function portfolioItemList(locale: Locale, t: Translate) {
  const authorName = t('hero.name')
  const items: ProjectEntity[] = [
    ...activeProducts.map((product) => activeEntity(locale, t, product, authorName)),
    ...pausedProjects.map((product) => pausedEntity(locale, t, product, authorName)),
    ...orderedArchive().map((project) => archiveEntity(locale, t, project, authorName)),
  ]
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      item,
    })),
  }
}

function activeEntity(locale: Locale, t: Translate, product: ActiveProduct, authorName: string): ProjectEntity {
  const page = product.page ? localeUrl(locale, product.page) : product.link!
  return entity({
    name: product.title,
    description: descriptionFor(t, product.key, false),
    url: product.key === 'context' ? page : product.link!,
    codeRepository: product.source,
    programmingLanguage: product.key === 'context' ? 'TypeScript' : undefined,
    license: product.key === 'context' ? 'MIT' : undefined,
    authorName,
  })
}

function pausedEntity(locale: Locale, t: Translate, product: PausedProject, authorName: string): ProjectEntity {
  return entity({
    name: product.title,
    description: descriptionFor(t, product.key, true),
    url: localeUrl(locale, product.page),
    codeRepository: product.source,
    programmingLanguage: 'TypeScript',
    license: 'MIT',
    authorName,
  })
}

function archiveEntity(locale: Locale, t: Translate, project: Project, authorName: string): ProjectEntity {
  const repositoryUrl = project.link
  return entity({
    name: project.titleKey ? t(project.titleKey) : project.title,
    description: descriptionFor(t, project.key),
    url: repositoryUrl ?? `${localeUrl(locale, '/')}#project-${project.key}`,
    codeRepository: repositoryUrl,
    programmingLanguage: project.key === 'chatgame' ? 'TypeScript' : undefined,
    authorName,
  })
}

export function projectPageEntity(locale: Locale, key: 'context' | 'dostigus', t: Translate): ProjectEntity {
  const list = portfolioItemList(locale, t)
  const match = list.itemListElement.find((entry) => entry.item.name === (key === 'context' ? 'Context' : 'Dostigus'))
  if (!match) {
    throw new Error(`Missing structured data for ${key}`)
  }
  return match.item
}
