-- Migration: Security Updates for Signature Process
-- Description: Adds columns for OTP verification, User Agent tracking, and Agreement Hashing.

-- 1. Add columns to 'collaborator' table (TypeORM entities use camelCase with quoted identifiers)
ALTER TABLE "collaborator" ADD COLUMN IF NOT EXISTS "userAgent" text;
ALTER TABLE "collaborator" ADD COLUMN IF NOT EXISTS "signatureHash" text;
ALTER TABLE "collaborator" ADD COLUMN IF NOT EXISTS "otpVerified" boolean DEFAULT false;
ALTER TABLE "collaborator" ADD COLUMN IF NOT EXISTS "otpVerifiedAt" TIMESTAMP;
ALTER TABLE "collaborator" ADD COLUMN IF NOT EXISTS "signatureSnapshotPath" text;
ALTER TABLE "collaborator" ADD COLUMN IF NOT EXISTS "identityDocPath" text;

-- 2. Add 'inviteToken' to 'split_sheet' if missing (fixes Audit Report issue)
ALTER TABLE "split_sheet" ADD COLUMN IF NOT EXISTS "inviteToken" text;

-- 3. Create index for inviteToken for faster lookups
CREATE INDEX IF NOT EXISTS "IDX_split_sheet_inviteToken" ON "split_sheet" ("inviteToken");

-- 4. Optional: If a previous migration created snake_case columns, rename them to match TypeORM.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'collaborator' AND column_name = 'user_agent'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'collaborator' AND column_name = 'userAgent'
  ) THEN
    ALTER TABLE "collaborator" RENAME COLUMN "user_agent" TO "userAgent";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'collaborator' AND column_name = 'signature_hash'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'collaborator' AND column_name = 'signatureHash'
  ) THEN
    ALTER TABLE "collaborator" RENAME COLUMN "signature_hash" TO "signatureHash";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'collaborator' AND column_name = 'otp_verified'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'collaborator' AND column_name = 'otpVerified'
  ) THEN
    ALTER TABLE "collaborator" RENAME COLUMN "otp_verified" TO "otpVerified";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'split_sheet' AND column_name = 'invite_token'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'split_sheet' AND column_name = 'inviteToken'
  ) THEN
    ALTER TABLE "split_sheet" RENAME COLUMN "invite_token" TO "inviteToken";
  END IF;
END
$$;
