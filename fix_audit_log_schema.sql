-- Ensure UUID generator exists (required for uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS "audit_log" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "action" character varying NOT NULL,
    "details" text,
    "ipAddress" character varying,
    "userId" uuid,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_audit_log_id" PRIMARY KEY ("id")
);

-- Add Foreign Key if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_audit_log_user') THEN 
        ALTER TABLE "audit_log" 
        ADD CONSTRAINT "FK_audit_log_user" 
        FOREIGN KEY ("userId") 
        REFERENCES "user"("id") 
        ON DELETE SET NULL; 
    END IF; 
END $$;

