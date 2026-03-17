export interface Project {
  key: string
  title: string
  icon: string
  stack: string[]
  link?: string
}

export interface SkillGroup {
  key: string
  icon: string
  items: string[]
}

export interface Contact {
  label: string
  icon: string
  to: string
}

export const projects: Project[] = [
  {
    key: 'meloteka',
    title: 'Meloteka',
    icon: 'i-lucide-music',
    stack: ['Nuxt', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'S3', 'Tailwind CSS'],
    link: 'https://meloteka.ru',
  },
  {
    key: 'startodel',
    title: 'Startodel',
    icon: 'i-lucide-utensils',
    stack: ['Nuxt', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'Tailwind CSS'],
    link: 'https://startodel.ru',
  },
  {
    key: 'chatgame',
    title: 'ChatGame',
    icon: 'i-lucide-gamepad-2',
    stack: ['TypeScript', 'Canvas API', 'WebSocket'],
    link: 'https://github.com/hmbanan666/chatgame',
  },
]

export const skillGroups: SkillGroup[] = [
  {
    key: 'frontend',
    icon: 'i-lucide-layout-dashboard',
    items: ['Vue 3', 'Nuxt', 'TypeScript', 'Tailwind CSS', 'Pinia', 'VueUse'],
  },
  {
    key: 'backend',
    icon: 'i-lucide-server',
    items: ['Nitro', 'Node.js', 'PostgreSQL', 'Drizzle ORM', 'S3'],
  },
  {
    key: 'tools',
    icon: 'i-lucide-wrench',
    items: ['Git', 'Docker', 'pnpm', 'Vitest', 'Playwright', 'GitHub Actions'],
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
    to: 'mailto:hmbanan666@hotmail.com',
  },
]

export const heroIcons = [
  'i-simple-icons-vuedotjs',
  'i-simple-icons-nuxtdotjs',
  'i-simple-icons-typescript',
  'i-simple-icons-postgresql',
  'i-simple-icons-tailwindcss',
  'i-simple-icons-docker',
]
