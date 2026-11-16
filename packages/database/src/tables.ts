import type { ForeignKeyBuilder } from 'drizzle-orm/pg-core'
import type { PublicationContent } from './publication'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { boolean, date, foreignKey, index, integer, jsonb, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'

export const cases = pgTable('cases', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  key: text('key').notNull().unique(),
  project: text('project').notNull(),
  tags: text('tags').array().notNull().default([]),
  icon: text('icon').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
})

export const caseTranslations = pgTable('case_translations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  locale: text('locale').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  task: text('task').notNull(),
  solution: text('solution').notNull(),
  result: text('result').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => [
  unique().on(t.caseId, t.locale),
  index('case_translations_case_id_idx').on(t.caseId),
])

export const caseViews = pgTable('case_views', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  ipHash: text('ip_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  unique().on(t.caseId, t.ipHash),
  index('case_views_case_id_idx').on(t.caseId),
])

export const caseReactions = pgTable('case_reactions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  emoji: text('emoji').notNull(),
  ipHash: text('ip_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  unique().on(t.caseId, t.ipHash),
  index('case_reactions_case_id_idx').on(t.caseId),
])

// Relations

export const casesRelations = relations(cases, ({ many }) => ({
  translations: many(caseTranslations),
  views: many(caseViews),
  reactions: many(caseReactions),
}))

export const caseTranslationsRelations = relations(caseTranslations, ({ one }) => ({
  case: one(cases, { fields: [caseTranslations.caseId], references: [cases.id] }),
}))

export const caseViewsRelations = relations(caseViews, ({ one }) => ({
  case: one(cases, { fields: [caseViews.caseId], references: [cases.id] }),
}))

export const caseReactionsRelations = relations(caseReactions, ({ one }) => ({
  case: one(cases, { fields: [caseReactions.caseId], references: [cases.id] }),
}))

export const publications = pgTable('publications', {
  slug: text('slug').primaryKey(),
  publishedRevision: text('published_revision'),
  publishedAt: date('published_at', { mode: 'string' }),
}, (t): ForeignKeyBuilder[] => [
  foreignKey({ columns: [t.slug, t.publishedRevision], foreignColumns: [publicationRevisions.slug, publicationRevisions.id], name: 'publications_live_revision_fk' }),
])

export const publicationRevisions = pgTable('publication_revisions', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().references(() => publications.slug),
  content: jsonb('content').$type<PublicationContent>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [unique('publication_revisions_slug_id_unique').on(t.slug, t.id)])

export const agentMessages = pgTable('agent_messages', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  sessionId: text('session_id').notNull(),
  role: text('role').$type<'user' | 'assistant'>().notNull(),
  content: text('content').notNull(),
  page: text('page').notNull(),
  locale: text('locale').notNull(),
  model: text('model').notNull(),
  filtered: boolean('filtered').notNull().default(false),
  filteredReason: text('filtered_reason'),
  sources: jsonb('sources').$type<{ title: string, url: string }[]>().notNull().default([]),
  latencyMs: integer('latency_ms').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('agent_messages_created_at_idx').on(t.createdAt),
  index('agent_messages_session_created_at_idx').on(t.sessionId, t.createdAt),
])
