-- =============================================
-- Social Contacts Migration
-- Adds linking fields to the contact table
-- =============================================

-- New columns for social linking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'contact' AND column_name = 'linkedUserId'
    ) THEN
        ALTER TABLE "contact" ADD COLUMN "linkedUserId" uuid;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'contact' AND column_name = 'status'
    ) THEN
        -- Use varchar instead of enum to avoid enum creation issues
        ALTER TABLE "contact" ADD COLUMN "status" varchar NOT NULL DEFAULT 'PENDING';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'contact' AND column_name = 'linkedAt'
    ) THEN
        ALTER TABLE "contact" ADD COLUMN "linkedAt" timestamp;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'contact' AND column_name = 'linkedUserAvatar'
    ) THEN
        ALTER TABLE "contact" ADD COLUMN "linkedUserAvatar" varchar;
    END IF;
END $$;

-- Make name nullable (it was NOT NULL before)
ALTER TABLE "contact" ALTER COLUMN "name" DROP NOT NULL;

-- Add lastSeenAt to user table (for Phase 3)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user' AND column_name = 'lastSeenAt'
    ) THEN
        ALTER TABLE "user" ADD COLUMN "lastSeenAt" timestamp;
    END IF;
END $$;

-- Create notification table
CREATE TABLE IF NOT EXISTS "notification" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "recipientId" uuid NOT NULL,
    "type" varchar NOT NULL DEFAULT 'SYSTEM',
    "title" varchar NOT NULL,
    "message" text NOT NULL,
    "actionUrl" varchar,
    "fromUserId" uuid,
    "fromUserName" varchar,
    "fromUserAvatar" varchar,
    "isRead" boolean DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_notification_id" PRIMARY KEY ("id"),
    CONSTRAINT "FK_notification_recipient" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE CASCADE
);
