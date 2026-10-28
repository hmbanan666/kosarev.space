import { publicationPath, publications } from '../../shared/publications'

export default defineEventHandler(async () => {
  const cases = await repository.case.findAll('ru')

  return [...cases.map((c) => ({
    loc: `/cases/${c.key}`,
    _i18nTransform: true,
  })), ...publications.map((publication) => ({
    loc: publicationPath(publication),
    _i18nTransform: true,
  }))]
})
