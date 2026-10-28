export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  return repository.publication.findAll()
})
