import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";
import { z } from "zod";
import type { UpdateApiKeyCommand } from "@/types";

const apiKeySchema = z.object({
  api_key: z.string().min(20, "API key must be at least 20 characters long"),
  provider: z.string().optional().default("openai"),
});

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    // Get user and supabase client from middleware
    const { user } = locals;
    const supabaseClient = (locals.authenticatedSupabase || locals.supabase) as any;

    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const body = await request.json();

    console.log("API Key endpoint - received body:", {
      hasApiKey: !!body.api_key,
      apiKeyLength: body.api_key?.length || 0,
      apiKeyPreview: body.api_key ? `${body.api_key.substring(0, 20)}...` : 'none',
      apiKeyStartsWithSk: body.api_key?.startsWith('sk-') || false,
      provider: body.provider
    });

    // Validate input
    const validation = apiKeySchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid input", 
          details: validation.error.errors 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { api_key, provider } = validation.data;

    // Validate OpenAI API key format
    if (!api_key.startsWith("sk-")) {
      return new Response(
        JSON.stringify({ error: "Invalid OpenAI API key format" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Test the API key with a simple OpenAI call
    try {
      const openai = new (await import("openai")).default({
        apiKey: api_key,
      });

      // Simple test call to verify the key works
      await openai.models.list();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired API key" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Upsert the API key
    const { data, error } = await supabaseClient
      .from("user_api_keys")
      .upsert(
        {
          user_id: userId,
          api_key: api_key,
          provider: provider,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error saving API key:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save API key" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: "API key updated successfully",
        data: {
          id: data.id,
          provider: data.provider,
          is_active: data.is_active,
          updated_at: data.updated_at,
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in API key update:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    // Get user and supabase client from middleware
    const { user } = locals;
    const supabaseClient = (locals.authenticatedSupabase || locals.supabase) as any;

    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Delete the API key
    const { error } = await supabaseClient
      .from("user_api_keys")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting API key:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete API key" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "API key deleted successfully" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in API key deletion:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Get user and supabase client from middleware
    const { user } = locals;
    const supabaseClient = (locals.authenticatedSupabase || locals.supabase) as any;

    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Get the API key info (without the actual key for security)
    const { data, error } = await supabaseClient
      .from("user_api_keys")
      .select("id, provider, is_active, created_at, updated_at, last_used_at, usage_count")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
      console.error("Error fetching API key info:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch API key info" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        data: data || null,
        has_api_key: !!data
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in API key fetch:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
