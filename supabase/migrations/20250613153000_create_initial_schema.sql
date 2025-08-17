-- Initial database schema for HealthyMeal application
-- This includes all tables, policies, and triggers in one migration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "preferences" text[] DEFAULT '{}',
    "status" text DEFAULT 'active',
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "status_changed_at" timestamp with time zone DEFAULT now()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS "public"."recipes" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "title" text NOT NULL,
    "content" jsonb NOT NULL,
    "query" text NOT NULL,
    "preferences" text[] DEFAULT '{}',
    "rating" integer,
    "is_visible" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

-- Create ai_usage table
CREATE TABLE IF NOT EXISTS "public"."ai_usage" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "model" text NOT NULL,
    "input_tokens" integer NOT NULL,
    "output_tokens" integer NOT NULL,
    "cost" decimal(10,6) NOT NULL,
    "created_at" timestamp with time zone DEFAULT now()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS "public"."ratings" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "recipe_id" uuid NOT NULL,
    "rating" integer NOT NULL CHECK (rating IN (1, -1)),
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

-- Add primary keys
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."recipes" ADD CONSTRAINT "recipes_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."ai_usage" ADD CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."ratings" ADD CONSTRAINT "ratings_pkey" PRIMARY KEY ("id");

-- Add unique constraints
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");
ALTER TABLE "public"."ratings" ADD CONSTRAINT "ratings_user_recipe_unique" UNIQUE ("user_id", "recipe_id");

-- Add foreign key constraints
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."recipes" ADD CONSTRAINT "recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."ai_usage" ADD CONSTRAINT "ai_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."ratings" ADD CONSTRAINT "ratings_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."recipes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ai_usage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ratings" ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "profiles_user_id_idx" ON "public"."profiles" ("user_id");
CREATE INDEX IF NOT EXISTS "recipes_user_id_idx" ON "public"."recipes" ("user_id");
CREATE INDEX IF NOT EXISTS "recipes_created_at_idx" ON "public"."recipes" ("created_at");
CREATE INDEX IF NOT EXISTS "recipes_rating_idx" ON "public"."recipes" ("rating");
CREATE INDEX IF NOT EXISTS "ai_usage_user_id_idx" ON "public"."ai_usage" ("user_id");
CREATE INDEX IF NOT EXISTS "ai_usage_created_at_idx" ON "public"."ai_usage" ("created_at");
CREATE INDEX IF NOT EXISTS "ratings_user_id_idx" ON "public"."ratings" ("user_id");
CREATE INDEX IF NOT EXISTS "ratings_recipe_id_idx" ON "public"."ratings" ("recipe_id");

-- Create trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, preferences, status)
  VALUES (NEW.id, '{}', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles table
-- Allow all operations (security handled by API endpoints)
CREATE POLICY "Allow all profile operations" ON profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- RLS Policies for recipes table
-- Users can view their own recipes
CREATE POLICY "Users can view own recipes" ON recipes
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can insert their own recipes
CREATE POLICY "Users can insert own recipes" ON recipes
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own recipes
CREATE POLICY "Users can update own recipes" ON recipes
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own recipes
CREATE POLICY "Users can delete own recipes" ON recipes
    FOR DELETE
    USING (user_id = auth.uid());

-- RLS Policies for ai_usage table
-- Users can view their own usage
CREATE POLICY "Users can view own usage" ON ai_usage
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can insert their own usage
CREATE POLICY "Users can insert own usage" ON ai_usage
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for ratings table
-- Users can view all ratings
CREATE POLICY "Users can view all ratings" ON ratings
    FOR SELECT
    USING (true);

-- Users can insert their own ratings
CREATE POLICY "Users can insert own ratings" ON ratings
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings" ON ratings
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own ratings
CREATE POLICY "Users can delete own ratings" ON ratings
    FOR DELETE
    USING (user_id = auth.uid());

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.recipes TO authenticated;
GRANT ALL ON public.ai_usage TO authenticated;
GRANT ALL ON public.ratings TO authenticated; 