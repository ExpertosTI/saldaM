-- Ensure UUID generator exists (required for uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Contact table if it doesn't exist
CREATE TABLE IF NOT EXISTS "contact" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" character varying NOT NULL,
    "email" character varying,
    "phone" character varying,
    "ipiNumber" character varying,
    "pro" character varying,
    "publishingCompany" character varying,
    "role" character varying NOT NULL DEFAULT 'SONGWRITER',
    "notes" character varying,
    "isFavorite" boolean NOT NULL DEFAULT false,
    "ownerId" uuid,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_contact_id" PRIMARY KEY ("id")
);

-- Add Foreign Key if not exists
DO $$ 
BEGIN 
    -- Ensure ownerId column exists for FK
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contact' AND column_name = 'ownerId'
    ) THEN
        ALTER TABLE "contact" ADD COLUMN "ownerId" uuid;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_contact_owner') THEN 
        ALTER TABLE "contact" 
        ADD CONSTRAINT "FK_contact_owner" 
        FOREIGN KEY ("ownerId") 
        REFERENCES "user"("id") 
        ON DELETE CASCADE; 
    END IF; 
END $$;
