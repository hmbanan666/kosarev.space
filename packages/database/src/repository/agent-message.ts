import { useDatabase } from '../database'
import { agentMessages } from '../tables'

export class AgentMessageRepository {
  static async save(messages: (typeof agentMessages.$inferInsert)[]) {
    await useDatabase().insert(agentMessages).values(messages)
  }
}
