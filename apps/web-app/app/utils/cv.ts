import { closedProjectYears } from './data'

export type CvLocale = 'ru' | 'en'

export interface CvPeriod {
  start: string
  end: string
}

export interface CvRole {
  key: string
  period: CvPeriod
  stack: string[]
  link?: string
  showDuration?: boolean
}

export interface CvEntry extends CvRole {
  company: string
  role: string
  summary: string
  highlights: string[]
  startLabel: string
  endLabel: string
  durationLabel?: string
}

export interface CvProject {
  key: string
  title: string
  description: string
  link?: string
  startedLabel?: string
  closedYear?: number
}

export const cvRoles: CvRole[] = [
  {
    key: 'expi',
    period: { start: '2026-04-27', end: '2026-10-27' },
    showDuration: true,
    stack: ['TypeScript', 'Nuxt / Nitro', 'PostgreSQL / Drizzle', 'Redis / BullMQ', 'Docker', 'grammY', 'MCP'],
    link: 'https://iipetrov.ru',
  },
  {
    key: 'sushilove',
    period: { start: '2025-05', end: '2026-02' },
    stack: ['Nuxt', 'Vue', 'TypeScript', 'PostgreSQL', 'RabbitMQ'],
    link: 'https://sushi-love.ru',
  },
  {
    key: 'o5',
    period: { start: '2017-06', end: '2024-02' },
    stack: ['TypeScript', 'React', 'NestJS', 'Kubernetes', 'PostgreSQL'],
    link: 'https://o5system.net',
  },
  {
    key: 'berry',
    period: { start: '2015-01', end: '2017-05' },
    stack: ['PHP', 'JavaScript', 'HTML / CSS'],
  },
  {
    key: 'freelance',
    period: { start: '2010-05', end: '2015-01' },
    stack: ['PHP', 'jQuery', 'MySQL', 'Apache / Nginx'],
  },
]

export const cvProjectLinks: { key: string, link?: string, started?: string, closedYear?: number }[] = [
  { key: 'startodel', started: '2025-12', closedYear: closedProjectYears.startodel },
  { key: 'meloteka', started: '2026-02', closedYear: closedProjectYears.meloteka },
  { key: 'nextorders', link: 'https://github.com/nextorders/food' },
]

export const cvPublicWork = {
  period: { start: '2024-04', end: '2025-11' },
  link: 'https://github.com/hmbanan666/chatgame',
}

export const cvContactLinks = [
  { label: 'nick@kosarev.space', href: 'mailto:nick@kosarev.space' },
  { label: 't.me/hmbanan666', href: 'https://t.me/hmbanan666' },
  { label: 'github.com/hmbanan666', href: 'https://github.com/hmbanan666' },
]

export const cvSkillGroups = [
  { key: 'web', skills: ['TypeScript', 'Vue', 'Nuxt', 'Nitro', 'Node.js'] },
  { key: 'systems', skills: ['PostgreSQL', 'Drizzle ORM', 'Redis', 'BullMQ', 'Docker', 'CI/CD'] },
  { key: 'integrations', skills: ['REST', 'WebSocket', 'Telegram / grammY', 'MCP', 'AI agents'] },
]

export function completedCvMonths(start: string, end: string): number {
  const [sy, sm, sd = 1] = start.split('-').map(Number)
  const [ey, em, ed = 1] = end.split('-').map(Number)
  return Math.max(0, (ey! - sy!) * 12 + em! - sm! - Number(ed < sd))
}

export function formatCvDate(value: string, locale: CvLocale): string {
  const [year, month, day = 1] = value.split('-').map(Number)
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    ...(value.length > 7 ? { day: 'numeric' as const } : {}),
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year!, month! - 1, day)))
}

export function formatCvPeriod(period: CvPeriod, locale: CvLocale): string {
  return `${formatCvDate(period.start, locale)} - ${formatCvDate(period.end, locale)}`
}
