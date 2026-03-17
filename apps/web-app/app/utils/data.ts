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

// Projects on homepage reference the same keys as experiences for i18n descriptions
export const projects: Project[] = [
  {
    key: 'meloteka',
    titleKey: 'projects.meloteka.title',
    title: 'Meloteka',
    icon: 'i-lucide-music',
    image: '/projects/meloteka.webp',
    stack: ['Nuxt', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'S3'],
    link: 'https://meloteka.ru',
  },
  {
    key: 'startodel',
    titleKey: 'projects.startodel.title',
    title: 'Startodel',
    icon: 'i-lucide-utensils',
    image: '/projects/startodel.webp',
    stack: ['Nuxt', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'Tailwind CSS'],
    link: 'https://startodel.ru',
  },
  {
    key: 'chatgame',
    title: 'ChatGame',
    icon: 'i-lucide-gamepad-2',
    image: '/projects/chatgame.webp',
    stack: ['TypeScript', 'Canvas API', 'WebSocket'],
    link: 'https://chatgame.space',
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

export interface Experience {
  key: string
  company: string
  nameKey?: string
  locationKey: string
  startYear: number
  startMonth: number
  endYear?: number
  endMonth?: number
  present?: boolean
  icon: string
  stack: string[]
  link?: string
}

export interface Language {
  key: string
  level: string
}

export const experiences: Experience[] = [
  {
    key: 'startodel',
    company: 'Startodel',
    nameKey: 'cv.companyStartodel',
    locationKey: 'kaliningrad',
    startYear: 2025,
    startMonth: 12,
    present: true,
    icon: 'i-lucide-utensils',
    stack: ['Nuxt', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'Tailwind CSS', 'S3'],
    link: 'https://startodel.ru',
  },
  {
    key: 'meloteka',
    company: 'Meloteka',
    nameKey: 'cv.companyMeloteka',
    locationKey: 'kaliningrad',
    startYear: 2026,
    startMonth: 2,
    present: true,
    icon: 'i-lucide-music',
    stack: ['Nuxt', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'S3', 'Tailwind CSS'],
    link: 'https://meloteka.ru',
  },
  {
    key: 'sushilove',
    company: 'Sushi-Love',
    locationKey: 'kaliningrad',
    startYear: 2025,
    startMonth: 5,
    endYear: 2026,
    endMonth: 2,
    icon: 'i-lucide-briefcase',
    stack: ['Nuxt', 'Vue', 'Pinia', 'TypeScript', 'PostgreSQL', 'RabbitMQ', 'k8s'],
    link: 'https://sushi-love.ru',
  },
  {
    key: 'o5',
    company: 'o5.Food',
    nameKey: 'cv.companyO5',
    locationKey: 'syktyvkar',
    startYear: 2017,
    startMonth: 6,
    endYear: 2024,
    endMonth: 2,
    icon: 'i-lucide-building-2',
    stack: ['TypeScript', 'React', 'NestJS', 'Kubernetes', 'PostgreSQL'],
    link: 'https://o5system.net',
  },
  {
    key: 'berry',
    company: 'Berry Design',
    locationKey: 'syktyvkar',
    startYear: 2015,
    startMonth: 1,
    endYear: 2017,
    endMonth: 5,
    icon: 'i-lucide-palette',
    stack: ['PHP', 'JavaScript', 'HTML', 'CSS'],
  },
  {
    key: 'freelance',
    company: 'Freelance',
    locationKey: 'syktyvkar',
    startYear: 2010,
    startMonth: 5,
    endYear: 2015,
    endMonth: 1,
    icon: 'i-lucide-laptop',
    stack: ['PHP', 'jQuery', 'MySQL', 'Apache', 'Nginx'],
  },
]

export const publicActivities: Experience[] = [
  {
    key: 'twitch',
    company: 'Twitch',
    locationKey: 'kaliningrad',
    startYear: 2024,
    startMonth: 4,
    present: true,
    icon: 'i-simple-icons-twitch',
    stack: ['TypeScript', 'WebSocket', 'Twitch API', 'Telegram Mini App'],
    link: 'https://twitch.tv/hmbanan666',
  },
  {
    key: 'nextorders',
    company: 'NextOrders',
    locationKey: 'kaliningrad',
    startYear: 2019,
    startMonth: 12,
    present: true,
    icon: 'i-lucide-rocket',
    stack: ['Nuxt', 'Nuxt UI', 'Pinia', 'Tailwind CSS', 'VueUse', 'Zod'],
    link: 'https://github.com/nextorders/food',
  },
]

export const languages: Language[] = [
  { key: 'russian', level: 'native' },
  { key: 'english', level: 'C1' },
]
