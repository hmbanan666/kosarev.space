import type { BoardData } from '@kosarev/database'
import type { ActivitySnapshot } from '../../shared/activity'
import { repository } from '@kosarev/database'
import { activityLayout } from '../../app/utils/home-canvas'
import { projectScores } from '../../shared/activity'
import { seedBoard } from '../../shared/board'

export function loadSharedBoard(): Promise<BoardData> {
  // Reserve the optional publication slot even while the feed is empty.
  return repository.homeBoard.load(async () => seedBoard(activityLayout(projectScores(await $fetch<ActivitySnapshot, '/api/activity'>('/api/activity')), true)))
}
