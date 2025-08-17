import type { APIRoute } from "astro";
import { AiService } from "../../../lib/services/ai.service";
import { aiUsageQuerySchema } from "../../../lib/schemas/ai-usage.schemas";
import type { AiUsageDto } from "../../../types";

/**
 * API endpoint for AI usage analytics.
 * 
 * This endpoint provides comprehensive statistics about user's AI generation usage,
 * including token usage, costs, and model breakdowns over different time periods.
 * 
 * @see {@link AiService} for business logic implementation
 * @see {@link AiUsageDto} for response type
 */

// Disable prerendering for this API route
export const prerender = false;

/**
 * GET /api/ai/usage
 * Retrieves AI usage statistics for the current user.
 * 
 * Query Parameters:
 * - period: Time period (day, week, month, year, custom) - defaults to "month"
 * - start_date: Custom start date for custom period (ISO date string)
 * - end_date: Custom end date for custom period (ISO date string)
 * 
 * @param request - The incoming request with query parameters
 * @param locals - Local context including user and supabase client
 * @returns AI usage statistics or error response
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Get user and supabase client from middleware
    const { user, supabase } = locals;
    
    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = {
      period: url.searchParams.get("period"),
      start_date: url.searchParams.get("start_date"),
      end_date: url.searchParams.get("end_date")
    };

    // Validate query parameters using Zod
    const validationResult = aiUsageQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: "Invalid query parameters", 
        details: validationResult.error.errors 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { period, start_date, end_date } = validationResult.data;

    // Create AiService instance
    const aiService = new AiService(supabase);

    // Get AI usage statistics
    const aiUsage = await aiService.getAiUsage(
      user.id,
      period,
      start_date,
      end_date
    );

    // Transform to AiUsageDto format
    const aiUsageDto: AiUsageDto = {
      period: aiUsage.period,
      start_date: aiUsage.start_date,
      end_date: aiUsage.end_date,
      total_generations: aiUsage.total_generations,
      total_input_tokens: aiUsage.total_input_tokens,
      total_output_tokens: aiUsage.total_output_tokens,
      total_cost: aiUsage.total_cost,
      models_used: aiUsage.models_used,
      daily_breakdown: aiUsage.daily_breakdown
    };

    return new Response(JSON.stringify(aiUsageDto), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in GET /api/ai/usage:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      // Check for validation errors
      if (error.message.includes("Custom period requires both start_date and end_date")) {
        return new Response(JSON.stringify({ 
          error: "Custom period requires both start_date and end_date" 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (error.message.includes("Start date must be before end date")) {
        return new Response(JSON.stringify({ 
          error: "Start date must be before end date" 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (error.message.includes("Invalid period specified")) {
        return new Response(JSON.stringify({ 
          error: "Invalid period specified" 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Check for database-specific errors
      if (error.message.includes("JWT")) {
        return new Response(JSON.stringify({ error: "Invalid authentication token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      if (error.message.includes("permission") || error.message.includes("RLS")) {
        return new Response(JSON.stringify({ error: "Access denied" }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
