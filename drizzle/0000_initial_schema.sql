CREATE TYPE "public"."request_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('new', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."request_type" AS ENUM('support', 'website_update', 'new_feature', 'other');--> statement-breakpoint
CREATE TABLE "requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"type" "request_type" NOT NULL,
	"status" "request_status" DEFAULT 'new' NOT NULL,
	"priority" "request_priority" DEFAULT 'normal' NOT NULL,
	"requester_name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"from_status" "request_status",
	"to_status" "request_status" NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "requests_status_idx" ON "requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "requests_type_idx" ON "requests" USING btree ("type");--> statement-breakpoint
CREATE INDEX "status_history_request_id_idx" ON "status_history" USING btree ("request_id");