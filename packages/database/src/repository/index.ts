import { Case } from './case'
import { PublicationRepository } from './publication'

class Repository {
  readonly case = Case
  readonly publication = PublicationRepository
}

export const repository = new Repository()
