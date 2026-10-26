import { describe, expect, it } from 'vitest'
import { completedCvMonths, cvContactLinks, cvProjectLinks, cvPublicWork, cvRoles, formatCvPeriod } from '../app/utils/cv'
import { closedProjectYearForCase, closedProjectYears, projects } from '../app/utils/data'
import en from '../i18n/locales/en.json'
import ru from '../i18n/locales/ru.json'

describe('cV facts and chronology', () => {
  it('keeps the supplied EXPI dates and counts six elapsed months, not seven calendar labels', () => {
    const expi = cvRoles.find((entry) => entry.key === 'expi')!
    expect(expi.period).toEqual({ start: '2026-04-27', end: '2026-10-27' })
    expect(completedCvMonths(expi.period.start, expi.period.end)).toBe(6)
    expect(completedCvMonths(expi.period.start, '2026-10-26')).toBe(5)
    expect(formatCvPeriod(expi.period, 'en')).toBe('27 Apr 2026 - 27 Oct 2026')
    expect(formatCvPeriod(expi.period, 'ru')).toContain('27 окт. 2026')
  })

  it('separates employment, independent projects and the ended Twitch activity', () => {
    expect(cvRoles.map((entry) => entry.key)).toEqual(['expi', 'sushilove', 'o5', 'berry', 'freelance'])
    expect(cvPublicWork.period.end).toBe('2025-11')
    expect(cvProjectLinks.map((project) => project.key)).toEqual(['startodel', 'meloteka', 'nextorders'])
    expect(cvContactLinks[0]?.href).toBe('mailto:nick@kosarev.space')
  })

  it('marks the three closed products without inventing individual closure months or changing NextOrders', () => {
    expect(closedProjectYears).toEqual({ startodel: 2026, meloteka: 2026, chatgame: 2026 })
    expect(projects.find((project) => project.key === 'startodel')?.link).toBeUndefined()
    expect(projects.find((project) => project.key === 'meloteka')?.link).toBeUndefined()
    expect(projects.find((project) => project.key === 'chatgame')?.link).toBe('https://github.com/hmbanan666/chatgame')
    expect(projects.find((project) => project.key === 'nextorders')?.link).toBe('https://github.com/nextorders/food')
    expect(closedProjectYearForCase('meloteka-transcoding')).toBe(2026)
    expect(closedProjectYearForCase('nextorders-i18n')).toBeUndefined()
    expect(closedProjectYearForCase('unrelated-meloteka')).toBeUndefined()
  })

  it.each([['ru', ru], ['en', en]] as const)('provides complete %s copy for all canonical roles and projects', (_, messages) => {
    expect(Object.keys(messages.cv.entries).sort()).toEqual(cvRoles.map((entry) => entry.key).sort())
    expect(Object.keys(messages.cv.projects).sort()).toEqual(cvProjectLinks.map((project) => project.key).sort())
    const bullets = messages.cv.entries.expi.highlights
    expect(bullets.length).toBeGreaterThanOrEqual(4)
    expect(bullets.length).toBeLessThanOrEqual(6)
    expect(bullets.join(' ')).toContain('Matrix')
    expect(messages.cv.languageText).toContain('C1')
  })

  it('states incomplete education and preserves co-founder attribution in both languages', () => {
    expect(ru.cv.educationText).toContain('Неоконченное')
    expect(en.cv.educationText).toContain('Incomplete higher education')
    expect(ru.cv.entries.berry.role).toContain('Сооснователь')
    expect(en.cv.entries.berry.role).toContain('Co-founder')
  })
})
