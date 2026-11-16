CREATE TABLE "agent_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"page" text NOT NULL,
	"locale" text NOT NULL,
	"model" text NOT NULL,
	"filtered" boolean DEFAULT false NOT NULL,
	"filtered_reason" text,
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"latency_ms" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "agent_messages_created_at_idx" ON "agent_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "agent_messages_session_created_at_idx" ON "agent_messages" USING btree ("session_id","created_at");