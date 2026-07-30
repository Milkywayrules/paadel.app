CREATE TABLE "audit_events" (
	"action" text NOT NULL,
	"actor_id" uuid,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metadata" text DEFAULT '{}' NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"resource_id" text NOT NULL,
	"resource_type" text NOT NULL
);
