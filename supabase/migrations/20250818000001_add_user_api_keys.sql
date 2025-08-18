-- Add user API keys table for OpenAI integration
-- This allows users to use their own API keys instead of the application's

-- Create user_api_keys table
CREATE TABLE IF NOT EXISTS "public"."user_api_keys" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "api_key" text NOT NULL,
    "provider" text NOT NULL DEFAULT 'openai',
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "last_used_at" timestamp with time zone,
    "usage_count" integer DEFAULT 0
);

-- Add primary key
ALTER TABLE "public"."user_api_keys" ADD CONSTRAINT "user_api_keys_pkey" PRIMARY KEY ("id");

-- Add unique constraints
ALTER TABLE "public"."user_api_keys" ADD CONSTRAINT "user_api_keys_user_id_key" UNIQUE ("user_id");

-- Add foreign key constraint
ALTER TABLE "public"."user_api_keys" ADD CONSTRAINT "user_api_keys_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE "public"."user_api_keys" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own API keys" ON "public"."user_api_keys"
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" ON "public"."user_api_keys"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON "public"."user_api_keys"
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON "public"."user_api_keys"
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "user_api_keys_user_id_idx" ON "public"."user_api_keys" ("user_id");
CREATE INDEX IF NOT EXISTS "user_api_keys_provider_idx" ON "public"."user_api_keys" ("provider");
CREATE INDEX IF NOT EXISTS "user_api_keys_is_active_idx" ON "public"."user_api_keys" ("is_active");

-- Add trigger function for updating updated_at
CREATE OR REPLACE FUNCTION public.update_user_api_keys_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
CREATE TRIGGER update_user_api_keys_updated_at
    BEFORE UPDATE ON public.user_api_keys
    FOR EACH ROW EXECUTE FUNCTION public.update_user_api_keys_updated_at();

-- Add trigger function for updating last_used_at and usage_count
CREATE OR REPLACE FUNCTION public.update_user_api_key_usage()
RETURNS trigger AS $$
BEGIN
    UPDATE public.user_api_keys 
    SET last_used_at = now(), usage_count = usage_count + 1
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating usage stats when AI is used
CREATE TRIGGER update_user_api_key_usage_trigger
    AFTER INSERT ON public.ai_usage
    FOR EACH ROW EXECUTE FUNCTION public.update_user_api_key_usage();
