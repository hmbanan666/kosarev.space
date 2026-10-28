export interface CasePreview {
  key: string
  title: string
  description: string
  tags: string[]
  icon?: string
}

export const caseAreas = ['interface', 'systems', 'delivery'] as const
export type CaseArea = typeof caseAreas[number]
export interface CaseFilters {
  q: string
  tech: string
  focus: CaseArea | ''
  all: boolean
}

export const featuredCaseKeys = [
  'expi-billing',
  'o5-rewrite',
  'meloteka-transcoding',
  'sushilove-async',
  'nextorders-i18n',
  'kosarev-live-cursors',
] as const

export function selectFeaturedCases<T extends CasePreview>(cases: T[], keys: readonly string[] = featuredCaseKeys, limit = 6): T[] {
  const available = new Map(cases.map((item) => [item.key, item]))
  const orderedKeys = new Set([...keys, ...cases.map((item) => item.key)])
  return [...orderedKeys].flatMap((key) => {
    const item = available.get(key)
    return item ? [item] : []
  }).slice(0, limit)
}

const areaTags: Record<CaseArea, string[]> = {
  interface: ['Vue', 'Nuxt', 'React', 'Next.js', 'Canvas API', 'Tailwind CSS', 'Nuxt UI'],
  systems: ['PostgreSQL', 'RabbitMQ', 'Redis', 'WebSocket', 'Node.js', 'NestJS', 'S3', 'Telegram Mini App'],
  delivery: ['Docker', 'Kubernetes', 'CI/CD', 'Nginx'],
}

export function readCaseFilters(query: Record<string, unknown>): CaseFilters {
  const text = (key: string, limit: number) => typeof query[key] === 'string' ? query[key].trim().slice(0, limit) : ''
  const focus = text('focus', 20)
  return {
    q: text('q', 100),
    tech: text('tech', 50),
    focus: caseAreas.includes(focus as CaseArea) ? focus as CaseArea : '',
    all: query.all === '1',
  }
}

export function caseContextQuery(query: Record<string, unknown>): Record<string, string> {
  const filters = readCaseFilters(query)
  return {
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.tech ? { tech: filters.tech } : {}),
    ...(filters.focus ? { focus: filters.focus } : {}),
    ...(filters.all ? { all: '1' } : {}),
  }
}

export function filterCases<T extends CasePreview>(cases: T[], filters: CaseFilters): T[] {
  const needle = filters.q.toLocaleLowerCase()
  return cases.filter((item) => {
    const text = [item.key, item.title, item.description, ...item.tags].join(' ').toLocaleLowerCase()
    return (!needle || text.includes(needle))
      && (!filters.tech || item.tags.includes(filters.tech))
      && (!filters.focus || item.tags.some((tag) => areaTags[filters.focus as CaseArea].includes(tag)))
  })
}
