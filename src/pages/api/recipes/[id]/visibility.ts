import type { APIRoute } from "astro";
import { RecipeService } from "../../../../lib/services/recipe.service";
import { recipeIdSchema, updateRecipeVisibilitySchema } from "../../../../lib/schemas/recipe.schemas";
import type { UpdatedRecipeVisibilityDto } from "../../../../types";

/**
 * API endpoint for updating recipe visibility.
 *
 * This endpoint allows users to change the visibility status of their recipes.
 * All operations require authentication and ownership verification.
 *
 * @see {@link RecipeService} for business logic implementation
 * @see {@link UpdatedRecipeVisibilityDto} for response type
 */

// Disable prerendering for this API route
export const prerender = false;

/**
 * PUT /api/recipes/{id}/visibility
 * Updates the visibility status of a specific recipe.
 *
 * @param request - The incoming request with visibility data
 * @param params - URL parameters including recipe ID
 * @param locals - Local context including user and supabase client
 * @returns Updated visibility status or error response
 */
export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    // Get user and supabase client from middleware
    const { user, supabase } = locals;

    if (!user?.id) {
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

    // Parse and validate request body
    let body: { is_visible: boolean };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate request body using Zod
    const validationResult = updateRecipeVisibilitySchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { is_visible } = validationResult.data;

    // Create RecipeService instance and update visibility
    const recipeService = new RecipeService(supabase);
    const updatedRecipe = await recipeService.updateVisibility(recipeId, user.id, is_visible);

    if (!updatedRecipe) {
      return new Response(JSON.stringify({ error: "Recipe not found or access denied" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Transform to UpdatedRecipeVisibilityDto
    const updatedVisibilityDto: UpdatedRecipeVisibilityDto = {
      id: updatedRecipe.id,
      is_visible: updatedRecipe.is_visible,
      updated_at: updatedRecipe.updated_at,
    };

    return new Response(JSON.stringify(updatedVisibilityDto), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PUT /api/recipes/[id]/visibility:", error);

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
