import { activeProducts, closedProjectYears, pausedProjects, projects } from './data'

interface CanvasProduct { key: string, title: string, titleKey?: string, page?: string, link?: string, status: string, closedYear?: number, pitch: string }
export const canvasProducts: CanvasProduct[] = [
  ...activeProducts.map((product) => ({ ...product, status: 'projects.statusActive', pitch: `projects.${product.key}.${product.key === 'context' ? 'description' : 'kind'}` })),
  { key: 'space', title: 'kosarev.space', page: '/cases/kosarev-live-cursors', link: 'https://kosarev.space', status: 'projects.statusActive', pitch: 'activity.spacePitch' },
  ...pausedProjects.map((product) => ({ ...product, status: 'projects.statusPaused', pitch: `projects.${product.key}.description` })),
  ...projects.map((product) => ({ key: product.key, title: product.title, titleKey: product.titleKey, page: `/projects#project-${product.key}`, closedYear: closedProjectYears[product.key], status: closedProjectYears[product.key] ? 'projects.closed' : 'projects.archiveTitle', pitch: `projects.${product.key}.description` })),
]
export const activityTechTags = [...new Set(projects.flatMap((project) => project.stack))].filter((tag) => ['Nuxt', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'WebSocket'].includes(tag))
