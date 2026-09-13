CREATE TABLE "listings" (
	"id" text PRIMARY KEY NOT NULL,
	"photo_url" text,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"condition" text NOT NULL,
	"address" text NOT NULL,
	"spot" text,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"posted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"pickup_at" timestamp with time zone,
	"status" text DEFAULT 'available' NOT NULL,
	"manage_token_hash" text NOT NULL,
	"taken_at" timestamp with time zone,
	CONSTRAINT "listings_manage_token_hash_unique" UNIQUE("manage_token_hash")
);
--> statement-breakpoint
CREATE INDEX "listings_status_pickup_idx" ON "listings" USING btree ("status","pickup_at");--> statement-breakpoint
CREATE INDEX "listings_taken_at_idx" ON "listings" USING btree ("taken_at");