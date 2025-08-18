-- Update rating type from integer to text
-- This migration changes the rating column from integer (1, -1) to text ('up', 'down')

-- First, drop the existing constraint
ALTER TABLE "public"."ratings" DROP CONSTRAINT IF EXISTS "ratings_rating_check";

-- Change the column type from integer to text using USING clause for conversion
ALTER TABLE "public"."ratings" ALTER COLUMN "rating" TYPE text USING 
  CASE 
    WHEN rating = 1 THEN 'up'::text
    WHEN rating = -1 THEN 'down'::text
    ELSE rating::text
  END;

-- Add new constraint for text values
ALTER TABLE "public"."ratings" ADD CONSTRAINT "ratings_rating_check" CHECK (rating IN ('up', 'down'));

-- Create proper index on ratings table for upsert operations
-- This index is crucial for upsert performance on (user_id, recipe_id) unique constraint
DROP INDEX IF EXISTS "ratings_user_recipe_idx";
CREATE INDEX IF NOT EXISTS "ratings_user_recipe_idx" ON "public"."ratings" ("user_id", "recipe_id");

-- Create trigger function to automatically update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on ratings table
DROP TRIGGER IF EXISTS update_ratings_updated_at ON "public"."ratings";
CREATE TRIGGER update_ratings_updated_at
    BEFORE UPDATE ON "public"."ratings"
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Remove incorrect index on recipes table
DROP INDEX IF EXISTS "recipes_rating_idx";
