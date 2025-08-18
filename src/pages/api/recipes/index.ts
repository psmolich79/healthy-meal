import type { APIRoute } from "astro";
import { RecipeService } from "../../../lib/services/recipe.service";
import { recipeListQuerySchema } from "../../../lib/schemas/recipe.schemas";
import type { PaginatedRecipesDto } from "../../../types";

/**
 * API endpoint for retrieving a paginated list of user's recipes.
 *
 * This endpoint provides filtering, sorting, and pagination capabilities
 * for users to browse their recipe collection efficiently.
 *
 * @see {@link RecipeService} for business logic implementation
 * @see {@link PaginatedRecipesDto} for response type
 */

// Disable prerendering for this API route
export const prerender = false;

/**
 * GET /api/recipes
 * Retrieves a paginated list of user's recipes with optional filtering and sorting.
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - visible_only: Show only visible recipes (default: false)
 * - sort: Sort order (default: created_at.desc)
 *
 * @param request - The incoming request with query parameters
 * @param locals - Local context including user and supabase client
 * @returns Paginated list of recipes or error response
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Get user and supabase client from middleware
    const { user, supabase } = locals;

    console.log("API /recipes - locals:", {
      hasUser: !!user,
      userId: user?.id,
      hasSupabase: !!supabase,
      supabaseType: typeof supabase,
      supabaseKeys: supabase ? Object.keys(supabase) : null,
      hasAuth: supabase?.auth ? true : false,
      hasFrom: typeof supabase?.from === "function",
    });

    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!supabase) {
      console.error("API /recipes - No supabase client in locals");
      return new Response(JSON.stringify({ error: "Database connection error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = {
      page: url.searchParams.get("page") || "1",
      limit: url.searchParams.get("limit") || "10",
      visible_only: url.searchParams.get("visible_only") || "false",
      sort: url.searchParams.get("sort") || "created_at_desc",
    };

    console.log("API /recipes - queryParams:", queryParams);

    // Validate query parameters using Zod
    const validationResult = recipeListQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      console.log("API /recipes - validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { page, limit, visible_only, sort } = validationResult.data;
    console.log("API /recipes - validated params:", { page, limit, visible_only, sort });

    // Create RecipeService instance and get recipes
    const recipeService = new RecipeService(supabase);
    console.log("API /recipes - RecipeService created, calling getRecipes...");

    const paginatedRecipes = await recipeService.getRecipes(user.id, page, limit, visible_only, sort);

    console.log("API /recipes - recipes retrieved successfully, count:", paginatedRecipes.recipes.length);

    return new Response(JSON.stringify(paginatedRecipes), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/recipes:", error);

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

      // Check for validation errors
      if (error.message.includes("Invalid") || error.message.includes("must be")) {
        return new Response(
          JSON.stringify({
            error: "Invalid query parameters",
            message: error.message,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
