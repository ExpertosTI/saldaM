-- FIX: Add missing inviteToken column to split_sheet table
ALTER TABLE "split_sheet" ADD COLUMN IF NOT EXISTS "inviteToken" VARCHAR;

-- VERIFY: Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'split_sheet' AND column_name = 'inviteToken';
