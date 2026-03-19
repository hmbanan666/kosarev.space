import { count, eq, inArray, sql } from 'drizzle-orm'
import { useDatabase } from '../database'
import { caseReactions, cases, caseTranslations, caseViews } from '../tables'

async function getStatsBatch(db: ReturnType<typeof useDatabase>, caseIds: string[]) {
  if (!caseIds.length) {
    return new Map<string, { views: number, reactions: Record<string, number> }>()
  }

  const [viewsRows, reactionsRows] = await Promise.all([
    db.select({ caseId: caseViews.caseId, count: count() })
      .from(caseViews)
      .where(inArray(caseViews.caseId, caseIds))
      .groupBy(caseViews.caseId),
    db.select({ caseId: caseReactions.caseId, emoji: caseReactions.emoji, count: count() })
      .from(caseReactions)
      .where(inArray(caseReactions.caseId, caseIds))
      .groupBy(caseReactions.caseId, caseReactions.emoji),
  ])

  const stats = new Map<string, { views: number, reactions: Record<string, number> }>()

  for (const id of caseIds) {
    stats.set(id, { views: 0, reactions: {} })
  }
  for (const r of viewsRows) {
    stats.get(r.caseId)!.views = r.count
  }
  for (const r of reactionsRows) {
    stats.get(r.caseId)!.reactions[r.emoji] = r.count
  }

  return stats
}

function caseIdSubquery(key: string) {
  return sql`(SELECT id FROM ${cases} WHERE ${cases.key} = ${key})`
}

function pickContent<T extends { locale: string }>(translations: T[], locale: string) {
  return translations.find((t) => t.locale === locale)
    ?? translations.find((t) => t.locale === 'ru')
}

export const Case = {
  async findAll(locale: string) {
    const db = useDatabase()
    const rows = await db.query.cases.findMany({
      with: { translations: true },
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    })

    const stats = await getStatsBatch(db, rows.map((r) => r.id))

    return rows.map((row) => {
      const content = pickContent(row.translations, locale)
      return {
        key: row.key,
        tags: row.tags,
        icon: row.icon,
        title: content?.title ?? '',
        description: content?.description ?? '',
        stats: stats.get(row.id) ?? { views: 0, reactions: {} },
      }
    })
  },

  async findByKey(key: string, locale: string) {
    const db = useDatabase()
    const row = await db.query.cases.findFirst({
      where: eq(cases.key, key),
      with: { translations: true },
    })

    if (!row) {
      return null
    }

    const content = pickContent(row.translations, locale)
    if (!content) {
      return null
    }

    const stats = await getStatsBatch(db, [row.id])

    return {
      key: row.key,
      tags: row.tags,
      icon: row.icon,
      image: row.image,
      title: content.title,
      description: content.description,
      task: content.task,
      solution: content.solution,
      result: content.result,
      stats: stats.get(row.id) ?? { views: 0, reactions: {} },
    }
  },

  async findRelated(key: string, tags: string[], locale: string, limit = 4) {
    const db = useDatabase()
    const allCases = await db.query.cases.findMany({
      with: { translations: true },
    })

    return allCases
      .filter((c) => c.key !== key && c.tags.some((t) => tags.includes(t)))
      .slice(0, limit)
      .map((c) => {
        const content = pickContent(c.translations, locale)
        return {
          key: c.key,
          tags: c.tags,
          icon: c.icon,
          title: content?.title ?? '',
          description: content?.description ?? '',
        }
      })
  },

  async addView(caseKey: string, ipHash: string) {
    const db = useDatabase()
    await db.insert(caseViews).values({
      caseId: sql`${caseIdSubquery(caseKey)}`,
      ipHash,
    }).onConflictDoNothing()
  },

  async setReaction(caseKey: string, emoji: string, ipHash: string) {
    const db = useDatabase()
    const sub = caseIdSubquery(caseKey)

    await db.transaction(async (tx) => {
      await tx.delete(caseReactions)
        .where(sql`${caseReactions.caseId} = ${sub} AND ${caseReactions.ipHash} = ${ipHash}`)

      if (emoji) {
        await tx.insert(caseReactions).values({
          caseId: sql`${sub}`,
          emoji,
          ipHash,
        })
      }
    })
  },

  async removeReaction(caseKey: string, ipHash: string) {
    const db = useDatabase()
    await db.delete(caseReactions)
      .where(sql`${caseReactions.caseId} = ${caseIdSubquery(caseKey)} AND ${caseReactions.ipHash} = ${ipHash}`)
  },

  async create(data: { key: string, project: string, tags: string[], icon: string, image?: string }) {
    const db = useDatabase()
    const [row] = await db.insert(cases).values(data).returning()
    return row
  },

  async createTranslation(data: { caseId: string, locale: string, title: string, description: string, task: string, solution: string, result: string }) {
    const db = useDatabase()
    const [row] = await db.insert(caseTranslations).values(data).returning()
    return row
  },
}
