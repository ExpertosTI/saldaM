-- 1. Fix Missing inviteToken column (Causes 500 Error on Split Sheet Create)
ALTER TABLE "split_sheet" ADD COLUMN IF NOT EXISTS "inviteToken" VARCHAR;

-- 2. Verify User Table changes (Signature)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "signatureUrl" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "hasRegisteredSignature" BOOLEAN DEFAULT FALSE;
