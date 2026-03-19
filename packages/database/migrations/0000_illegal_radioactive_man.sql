CREATE TABLE "case_reactions" (
	"id" text PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"emoji" text NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "case_reactions_case_id_ip_hash_unique" UNIQUE("case_id","ip_hash")
);
--> statement-breakpoint
CREATE TABLE "case_translations" (
	"id" text PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"task" text NOT NULL,
	"solution" text NOT NULL,
	"result" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "case_translations_case_id_locale_unique" UNIQUE("case_id","locale")
);
--> statement-breakpoint
CREATE TABLE "case_views" (
	"id" text PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "case_views_case_id_ip_hash_unique" UNIQUE("case_id","ip_hash")
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"project" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"icon" text NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cases_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "case_reactions" ADD CONSTRAINT "case_reactions_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_translations" ADD CONSTRAINT "case_translations_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_views" ADD CONSTRAINT "case_views_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "case_reactions_case_id_idx" ON "case_reactions" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "case_views_case_id_idx" ON "case_views" USING btree ("case_id");