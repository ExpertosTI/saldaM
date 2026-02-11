-- Add missing columns to Contact table
ALTER TABLE "contact" ADD COLUMN IF NOT EXISTS "publishingCompany" character varying;
ALTER TABLE "contact" ADD COLUMN IF NOT EXISTS "ipiNumber" character varying;
ALTER TABLE "contact" ADD COLUMN IF NOT EXISTS "pro" character varying;
ALTER TABLE "contact" ADD COLUMN IF NOT EXISTS "notes" character varying;
ALTER TABLE "contact" ADD COLUMN IF NOT EXISTS "role" character varying DEFAULT 'SONGWRITER';
ALTER TABLE "contact" ADD COLUMN IF NOT EXISTS "isFavorite" boolean DEFAULT false;

-- Ensure ownerId foreign key exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact' AND column_name='ownerId') THEN
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
