import { Case } from './case'

class Repository {
  readonly case = Case
}

export const repository = new Repository()
