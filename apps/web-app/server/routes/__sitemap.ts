import { publicationPath } from '../../shared/publications'

export default defineEventHandler(async () => {
  const [cases, publications] = await Promise.all([repository.case.findAll('ru'), repository.publication.findAll()])

  return [...cases.map((c) => ({
    loc: `/cases/${c.key}`,
    _i18nTransform: true,
  })), ...publications.map((publication) => ({
    loc: publicationPath(publication),
    _i18nTransform: true,
  }))]
})
