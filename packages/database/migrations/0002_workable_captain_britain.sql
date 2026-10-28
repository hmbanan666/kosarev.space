CREATE TABLE "publication_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "publication_revisions_slug_id_unique" UNIQUE("slug","id")
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"slug" text PRIMARY KEY NOT NULL,
	"published_revision" text,
	"published_at" date
);
--> statement-breakpoint
ALTER TABLE "publication_revisions" ADD CONSTRAINT "publication_revisions_slug_publications_slug_fk" FOREIGN KEY ("slug") REFERENCES "public"."publications"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_live_revision_fk" FOREIGN KEY ("slug","published_revision") REFERENCES "public"."publication_revisions"("slug","id") ON DELETE no action ON UPDATE no action;