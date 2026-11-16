import { AgentMessageRepository } from './agent-message'
import { Case } from './case'
import { PublicationRepository } from './publication'

class Repository {
  readonly agentMessage = AgentMessageRepository
  readonly case = Case
  readonly publication = PublicationRepository
}

export const repository = new Repository()
