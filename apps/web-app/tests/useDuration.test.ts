import { describe, expect, it } from 'vitest'
import { calcMonths, formatAge, formatDuration, pluralEn, pluralRu } from '../app/utils/duration'

describe('pluralRu', () => {
  it('1 год', () => {
    expect(pluralRu(1, 'год', 'года', 'лет')).toBe('1 год')
  })

  it('2-4 года', () => {
    expect(pluralRu(2, 'год', 'года', 'лет')).toBe('2 года')
    expect(pluralRu(3, 'год', 'года', 'лет')).toBe('3 года')
    expect(pluralRu(4, 'год', 'года', 'лет')).toBe('4 года')
  })

  it('5-20 лет', () => {
    expect(pluralRu(5, 'год', 'года', 'лет')).toBe('5 лет')
    expect(pluralRu(10, 'год', 'года', 'лет')).toBe('10 лет')
    expect(pluralRu(11, 'год', 'года', 'лет')).toBe('11 лет')
    expect(pluralRu(15, 'год', 'года', 'лет')).toBe('15 лет')
    expect(pluralRu(19, 'год', 'года', 'лет')).toBe('19 лет')
  })

  it('21, 22 — снова год/года', () => {
    expect(pluralRu(21, 'год', 'года', 'лет')).toBe('21 год')
    expect(pluralRu(22, 'год', 'года', 'лет')).toBe('22 года')
  })

  it('months pluralization', () => {
    expect(pluralRu(1, 'месяц', 'месяца', 'месяцев')).toBe('1 месяц')
    expect(pluralRu(3, 'месяц', 'месяца', 'месяцев')).toBe('3 месяца')
    expect(pluralRu(5, 'месяц', 'месяца', 'месяцев')).toBe('5 месяцев')
    expect(pluralRu(11, 'месяц', 'месяца', 'месяцев')).toBe('11 месяцев')
  })
})

describe('pluralEn', () => {
  it('singular', () => {
    expect(pluralEn(1, 'yr')).toBe('1 yr')
  })

  it('plural', () => {
    expect(pluralEn(2, 'yr')).toBe('2 yrs')
    expect(pluralEn(10, 'yr')).toBe('10 yrs')
  })
})

describe('formatDuration', () => {
  it('only years (ru)', () => {
    expect(formatDuration(24, 'ru')).toBe('2 года')
    expect(formatDuration(12, 'ru')).toBe('1 год')
    expect(formatDuration(60, 'ru')).toBe('5 лет')
  })

  it('only months (ru)', () => {
    expect(formatDuration(3, 'ru')).toBe('3 месяца')
    expect(formatDuration(1, 'ru')).toBe('1 месяц')
  })

  it('years + months (ru)', () => {
    expect(formatDuration(14, 'ru')).toBe('1 год 2 месяца')
    expect(formatDuration(27, 'ru')).toBe('2 года 3 месяца')
  })

  it('zero months fallback (ru)', () => {
    expect(formatDuration(0, 'ru')).toBe('< 1 месяца')
  })

  it('only years (en)', () => {
    expect(formatDuration(24, 'en')).toBe('2 yrs')
    expect(formatDuration(12, 'en')).toBe('1 yr')
  })

  it('only months (en)', () => {
    expect(formatDuration(3, 'en')).toBe('3 mo')
  })

  it('years + months (en)', () => {
    expect(formatDuration(14, 'en')).toBe('1 yr 2 mo')
  })

  it('zero months fallback (en)', () => {
    expect(formatDuration(0, 'en')).toBe('< 1 mo')
  })
})

describe('formatAge', () => {
  it('ru', () => {
    expect(formatAge(33, 'ru')).toBe('33 года')
    expect(formatAge(25, 'ru')).toBe('25 лет')
    expect(formatAge(21, 'ru')).toBe('21 год')
  })

  it('en', () => {
    expect(formatAge(33, 'en')).toBe('33 years old')
  })
})

describe('calcMonths', () => {
  it('same year', () => {
    expect(calcMonths(2024, 1, 2024, 6)).toBe(5)
  })

  it('across years', () => {
    expect(calcMonths(2020, 6, 2024, 2)).toBe(44)
  })

  it('same month', () => {
    expect(calcMonths(2024, 5, 2024, 5)).toBe(0)
  })
})
