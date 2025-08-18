import type { APIRoute } from "astro";
import { RecipeService } from "../../../lib/services/recipe.service";
import { recipeIdSchema } from "../../../lib/schemas/recipe.schemas";
import type { RecipeDetailsDto } from "../../../types";

/**
 * API endpoint for managing individual recipes.
 *
 * This endpoint provides operations for:
 * - GET: Retrieve detailed recipe information
 *
 * All operations require authentication via JWT token in the Authorization header.
 * The endpoint enforces Row-Level Security (RLS) policies to ensure users can only
 * access their own recipe data.
 *
 * @see {@link RecipeService} for business logic implementation
 * @see {@link RecipeDetailsDto} for response type
 */

// Disable prerendering for this API route
export const prerender = false;

/**
 * GET /api/recipes/{id}
 * Retrieves detailed information about a specific recipe.
 *
 * @param request - The incoming request
 * @param params - URL parameters including recipe ID
 * @param locals - Local context including user and supabase client
 * @returns Recipe details or error response
 */
export const GET: APIRoute = async ({ params, locals, request }) => {
  try {
    // Debug: Check what we have in locals
    console.log("GET /api/recipes/[id] - locals.user:", locals.user);
    console.log("GET /api/recipes/[id] - auth header:", request.headers.get("authorization") ? "Present" : "Missing");

    // Get user and supabase client from middleware
    const { user, supabase } = locals;

    if (!user?.id) {
      console.log("GET /api/recipes/[id] - No user in locals");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate recipe ID parameter
    const recipeIdValidation = recipeIdSchema.safeParse(params.id);
    if (!recipeIdValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid recipe ID",
          details: recipeIdValidation.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const recipeId = recipeIdValidation.data;

    // Create RecipeService instance with authenticated client for RLS
    const supabaseClient = locals.authenticatedSupabase || locals.supabase;
    const recipeService = new RecipeService(supabaseClient);
    const recipe = await recipeService.getRecipe(recipeId, user.id);

    if (!recipe) {
      return new Response(JSON.stringify({ error: "Recipe not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user rating for this recipe
    const userRating = await recipeService.getUserRating(recipeId, user.id);

    // Transform to RecipeDetailsDto
    const recipeDetailsDto: RecipeDetailsDto = {
      ...recipe,
      is_saved: false, // TODO: Implement saved recipes functionality
      user_rating: userRating?.rating || null,
    };

    return new Response(JSON.stringify(recipeDetailsDto), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/recipes/[id]:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for database-specific errors
      if (error.message.includes("JWT")) {
        return new Response(JSON.stringify({ error: "Invalid authentication token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (error.message.includes("permission") || error.message.includes("RLS")) {
        return new Response(JSON.stringify({ error: "Access denied" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
