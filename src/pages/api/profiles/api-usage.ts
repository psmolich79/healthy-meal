import type { APIRoute } from "astro";
import { ApiUsageService } from "../../../lib/services/api-usage.service";

export const prerender = false;

/**
 * GET /api/profiles/api-usage
 * Retrieves the current user's API usage limits and statistics.
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    // Get user and supabase client from middleware
    const { user, supabase } = locals;

    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create ApiUsageService instance and get usage stats
    const apiUsageService = new ApiUsageService(supabase);
    const usageStats = await apiUsageService.getUserUsageStats(user.id);

    return new Response(JSON.stringify({
      data: usageStats,
      limits: usageStats.limits,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in GET /api/profiles/api-usage:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
