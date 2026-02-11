-- Migration: Security Updates for Signature Process
-- Description: Adds columns for OTP verification, User Agent tracking, and Agreement Hashing.

-- 1. Add columns to 'collaborator' table
ALTER TABLE "collaborator" ADD COLUMN IF NOT EXISTS "user_agent" text;
ALTER TABLE "collaborator" ADD COLUMN IF NOT EXISTS "signature_hash" text;
ALTER TABLE "collaborator" ADD COLUMN IF NOT EXISTS "otp_verified" boolean DEFAULT false;

-- 2. Add 'invite_token' to 'split_sheet' if missing (fixes Audit Report issue)
ALTER TABLE "split_sheet" ADD COLUMN IF NOT EXISTS "invite_token" text;

-- 3. Create index for invite_token for faster lookups
CREATE INDEX IF NOT EXISTS "IDX_split_sheet_invite_token" ON "split_sheet" ("invite_token");
