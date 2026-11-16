import { activeProducts, projects } from './data'

export const canvasProducts = [...activeProducts, { key: 'space', title: 'kosarev.space', page: '/cases/kosarev-live-cursors', link: 'https://kosarev.space' }]
export const activityTechTags = [...new Set(projects.flatMap((project) => project.stack))].filter((tag) => ['Nuxt', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'WebSocket'].includes(tag))
