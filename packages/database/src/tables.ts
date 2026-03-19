import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'

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
