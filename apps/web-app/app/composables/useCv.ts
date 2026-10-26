import type { CvEntry, CvLocale, CvProject } from '~/utils/cv'
import { completedCvMonths, cvProjectLinks, cvPublicWork, cvRoles, formatCvDate, formatCvPeriod } from '~/utils/cv'
import { formatDuration } from '~/utils/duration'

export function useCv() {
  const { t, locale } = useI18n()
  const { getHighlights } = useHighlights()
  const cvLocale = computed<CvLocale>(() => locale.value === 'en' ? 'en' : 'ru')

  const entries = computed<CvEntry[]>(() => cvRoles.map((entry) => ({
    ...entry,
    company: t(`cv.entries.${entry.key}.company`),
    role: t(`cv.entries.${entry.key}.role`),
    summary: t(`cv.entries.${entry.key}.summary`),
    highlights: getHighlights(`cv.entries.${entry.key}.highlights`),
    startLabel: formatCvDate(entry.period.start, cvLocale.value),
    endLabel: formatCvDate(entry.period.end, cvLocale.value),
    durationLabel: entry.showDuration
      ? formatDuration(completedCvMonths(entry.period.start, entry.period.end), cvLocale.value)
      : undefined,
  })))

  const selectedProjects = computed<CvProject[]>(() => cvProjectLinks.map((project) => ({
    ...project,
    startedLabel: project.started ? t('cv.projectStarted', { date: formatCvDate(project.started, cvLocale.value) }) : undefined,
    title: t(`cv.projects.${project.key}.title`),
    description: t(`cv.projects.${project.key}.description`),
  })))

  const publicPeriod = computed(() => formatCvPeriod(cvPublicWork.period, cvLocale.value))

  return { entries, selectedProjects, publicPeriod, cvLocale }
}
