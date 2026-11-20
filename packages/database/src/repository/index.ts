import { AgentMessageRepository } from './agent-message'
import { Case } from './case'
import { HomeBoardRepository } from './home-board'
import { PublicationRepository } from './publication'

class Repository {
  readonly homeBoard = HomeBoardRepository
  readonly agentMessage = AgentMessageRepository
  readonly case = Case
  readonly publication = PublicationRepository
}

export const repository = new Repository()
