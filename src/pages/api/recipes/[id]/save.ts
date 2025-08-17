import type { APIRoute } from "astro";
import { RecipeService } from "../../../../lib/services/recipe.service";

/**
 * API endpoint for saving/unsaving recipes.
 * 
 * This endpoint provides operations for:
 * - POST: Save a recipe to user's favorites
 * - DELETE: Remove a recipe from user's favorites
 * 
 * All operations require authentication via JWT token in the Authorization header.
 * The endpoint enforces Row-Level Security (RLS) policies.
 * 
 * @see {@link RecipeService} for business logic implementation
 */

// Disable prerendering for this API route
export const prerender = false;

/**
 * POST /api/recipes/{id}/save
 * Saves a recipe to the user's favorites.
 * 
 * @param request - The incoming request
 * @param params - URL parameters including recipe ID
 * @param locals - Local context including user and supabase client
 * @returns Success response or error
 */
export const POST: APIRoute = async ({ params, locals }) => {
  try {
    // Get user and supabase client from middleware
    const { user, supabase } = locals;
    
    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate recipe ID parameter
    if (!params.id) {
      return new Response(JSON.stringify({ error: "Recipe ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const recipeId = params.id;

    // Create RecipeService instance with authenticated client for RLS
    const supabaseClient = locals.authenticatedSupabase || locals.supabase;
    const recipeService = new RecipeService(supabaseClient);

    // Save recipe (this would typically add to a saved_recipes table)
    // For now, we'll just return success since we don't have a saved_recipes table yet
    const success = await recipeService.saveRecipe(recipeId, user.id);

    if (!success) {
      return new Response(JSON.stringify({ error: "Failed to save recipe" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ 
      message: "Recipe saved successfully",
      saved: true 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in POST /api/recipes/[id]/save:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
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

/**
 * DELETE /api/recipes/{id}/save
 * Removes a recipe from the user's favorites.
 * 
 * @param params - URL parameters including recipe ID
 * @param locals - Local context including user and supabase client
 * @returns Success response or error
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Get user and supabase client from middleware
    const { user, supabase } = locals;
    
    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate recipe ID parameter
    if (!params.id) {
      return new Response(JSON.stringify({ error: "Recipe ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const recipeId = params.id;

    // Create RecipeService instance with authenticated client for RLS
    const supabaseClient = locals.authenticatedSupabase || locals.supabase;
    const recipeService = new RecipeService(supabaseClient);

    // Unsave recipe
    const success = await recipeService.unsaveRecipe(recipeId, user.id);

    if (!success) {
      return new Response(JSON.stringify({ error: "Failed to unsave recipe" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ 
      message: "Recipe removed from favorites",
      saved: false 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in DELETE /api/recipes/[id]/save:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
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
