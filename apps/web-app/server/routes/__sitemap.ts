import { cases } from '../db/cases'

export default defineEventHandler(() => {
  return cases.map((c) => ({
    loc: `/cases/${c.key}`,
    _i18nTransform: true,
  }))
})
