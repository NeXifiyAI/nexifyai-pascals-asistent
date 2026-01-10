CREATE TABLE "Knowledge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"tags" json DEFAULT '[]'::json,
	"isActive" boolean DEFAULT true NOT NULL,
	"embeddingId" text,
	"metadata" json DEFAULT '{}'::json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Chat" DROP COLUMN "lastContext";