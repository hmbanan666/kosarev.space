export const closedProjectYears: Record<string, number> = {
  startodel: 2026,
  meloteka: 2026,
  chatgame: 2026,
}

export function closedProjectYearForCase(key: string): number | undefined {
  const project = Object.keys(closedProjectYears).find((name) => key.startsWith(`${name}-`))
  return project ? closedProjectYears[project] : undefined
}

export interface Project {
  key: string
  titleKey?: string
  title: string
  icon: string
  image?: string
  stack: string[]
  link?: string
}

export interface Contact {
  label: string
  icon: string
  to: string
}

export const projects: Project[] = [
  {
    key: 'meloteka',
    titleKey: 'projects.meloteka.title',
    title: 'Meloteka',
    icon: 'i-lucide-music',
    image: '/projects/meloteka.webp',
    stack: ['Nuxt', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'S3'],
  },
  {
    key: 'startodel',
    titleKey: 'projects.startodel.title',
    title: 'Startodel',
    icon: 'i-lucide-utensils',
    image: '/projects/startodel.webp',
    stack: ['Nuxt', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'Tailwind CSS'],
  },
  {
    key: 'chatgame',
    title: 'ChatGame',
    icon: 'i-lucide-gamepad-2',
    image: '/projects/chatgame.webp',
    stack: ['TypeScript', 'Canvas API', 'WebSocket'],
    link: 'https://github.com/hmbanan666/chatgame',
  },
  {
    key: 'nextorders',
    title: 'NextOrders',
    icon: 'i-lucide-rocket',
    image: '/projects/nextorders.webp',
    stack: ['Nuxt', 'Nuxt UI', 'Pinia', 'Tailwind CSS', 'VueUse', 'Zod'],
    link: 'https://github.com/nextorders/food',
  },
]

export const contacts: Contact[] = [
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    to: 'https://github.com/hmbanan666',
  },
  {
    label: 'Telegram',
    icon: 'i-simple-icons-telegram',
    to: 'https://t.me/hmbanan666',
  },
  {
    label: 'Email',
    icon: 'i-lucide-mail',
    to: 'mailto:nick@kosarev.space',
  },
  {
    label: 'Twitch',
    icon: 'i-simple-icons-twitch',
    to: 'https://twitch.tv/hmbanan666',
  },
]
