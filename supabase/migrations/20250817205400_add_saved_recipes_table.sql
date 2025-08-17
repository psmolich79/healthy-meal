-- Add saved_recipes table for user favorites
CREATE TABLE IF NOT EXISTS "public"."saved_recipes" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "recipe_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Add unique constraint to prevent duplicate saves
ALTER TABLE "public"."saved_recipes" ADD CONSTRAINT "saved_recipes_user_recipe_unique" UNIQUE ("user_id", "recipe_id");

-- Add foreign key constraints
ALTER TABLE "public"."saved_recipes" ADD CONSTRAINT "saved_recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."saved_recipes" ADD CONSTRAINT "saved_recipes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE "public"."saved_recipes" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved recipes" ON "public"."saved_recipes"
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved recipes" ON "public"."saved_recipes"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved recipes" ON "public"."saved_recipes"
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "saved_recipes_user_id_idx" ON "public"."saved_recipes" ("user_id");
CREATE INDEX IF NOT EXISTS "saved_recipes_recipe_id_idx" ON "public"."saved_recipes" ("recipe_id");
CREATE INDEX IF NOT EXISTS "saved_recipes_created_at_idx" ON "public"."saved_recipes" ("created_at");
