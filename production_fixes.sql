-- Fix 500 Error on Delete Split Sheet
-- Enable CASCADE DELETE on Collaborators when a Split Sheet is deleted

-- 1. Drop existing constraint (name might vary, try standard TypeORM naming or check DB)
ALTER TABLE "collaborator" DROP CONSTRAINT IF EXISTS "FK_split_sheet_id";

-- 2. Add constraint with ON DELETE CASCADE
ALTER TABLE "collaborator" 
ADD CONSTRAINT "FK_split_sheet_id" 
FOREIGN KEY ("splitSheetId") 
REFERENCES "split_sheet"("id") 
ON DELETE CASCADE;
