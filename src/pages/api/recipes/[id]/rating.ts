import type { APIRoute } from "astro";
import { RatingService } from "../../../../lib/services/rating.service";
import { RecipeService } from "../../../../lib/services/recipe.service";
import { upsertRatingSchema } from "../../../../lib/schemas/rating.schemas";
// Schema for recipe ID validation
const recipeIdSchema = (value: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * API endpoint for managing recipe ratings.
 * 
 * This endpoint provides operations for:
 * - POST: Add or update a user's rating for a recipe
 * 
 * All operations require authentication via JWT token in the Authorization header.
 * The endpoint enforces Row-Level Security (RLS) policies to ensure users can only
 * rate recipes they have access to.
 * 
 * @see {@link RatingService} for business logic implementation
 */

// Disable prerendering for this API route
export const prerender = false;

/**
 * POST /api/recipes/{id}/rating
 * Adds or updates a user's rating for a specific recipe.
 * 
 * @param request - The incoming request
 * @param params - URL parameters including recipe ID
 * @param locals - Local context including user and supabase client
 * @returns Success response or error
 */
export const POST: APIRoute = async ({ request, params, locals }) => {
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

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate rating data and transform to integer
    const ratingValidation = upsertRatingSchema.safeParse(body);
    if (!ratingValidation.success) {
      return new Response(JSON.stringify({ 
        error: "Invalid rating data",
        details: ratingValidation.error.errors 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { rating } = ratingValidation.data;
    // rating is now transformed to 1 (up) or -1 (down)

    // Create RatingService instance with authenticated client for RLS
    const supabaseClient = locals.authenticatedSupabase || locals.supabase;
    const ratingService = new RatingService(supabaseClient);

    // Add or update rating
    const result = await ratingService.addRating(recipeId, user.id, rating);

    if (!result) {
      return new Response(JSON.stringify({ error: "Failed to add rating" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ 
      message: "Rating added successfully",
      rating: result.rating 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in POST /api/recipes/[id]/rating:", error);
    
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
 * PUT /api/recipes/{id}/rating
 * Updates an existing rating for a specific recipe.
 * 
 * @param request - The incoming request with updated rating data
 * @param params - URL parameters including recipe ID
 * @param locals - Local context including user and supabase client
 * @returns Updated rating or error response
 */
export const PUT: APIRoute = async ({ request, params, locals }) => {
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
    if (!params.id || !recipeIdSchema(params.id)) {
      return new Response(JSON.stringify({ 
        error: "Invalid recipe ID"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const recipeId = params.id;

    // Parse and validate request body
    let body: { rating: string };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate request body using Zod
    const validationResult = upsertRatingSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: "Validation failed", 
        details: validationResult.error.errors 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { rating } = validationResult.data;

    // Create service instances
    const ratingService = new RatingService(supabase);
    const recipeService = new RecipeService(supabase);

    // Verify recipe exists and user owns it
    const recipe = await recipeService.getRecipe(recipeId, user.id);
    if (!recipe) {
      return new Response(JSON.stringify({ error: "Recipe not found or access denied" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Update the rating
    const updatedRating = await ratingService.updateRating(recipeId, user.id, rating);

    if (!updatedRating) {
      return new Response(JSON.stringify({ error: "Failed to update rating" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(updatedRating), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in PUT /api/recipes/[id]/rating:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      // Check for rating not found error
      if (error.message.includes("Rating not found")) {
        return new Response(JSON.stringify({ error: "Rating not found for this recipe" }), {
          status: 404,
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

/**
 * DELETE /api/recipes/{id}/rating
 * Removes a rating for a specific recipe.
 * 
 * @param params - URL parameters including recipe ID
 * @param locals - Local context including user and supabase client
 * @returns Success message or error response
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
    if (!params.id || !recipeIdSchema(params.id)) {
      return new Response(JSON.stringify({ 
        error: "Invalid recipe ID"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const recipeId = params.id;

    // Create service instances
    const ratingService = new RatingService(supabase);
    const recipeService = new RecipeService(supabase);

    // Verify recipe exists and user owns it
    const recipe = await recipeService.getRecipe(recipeId, user.id);
    if (!recipe) {
      return new Response(JSON.stringify({ error: "Recipe not found or access denied" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Delete the rating
    const deletionSuccess = await ratingService.deleteRating(recipeId, user.id);

    if (!deletionSuccess) {
      return new Response(JSON.stringify({ error: "Failed to delete rating" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Return success message
    const deletedRatingDto = {
      message: "Rating deleted successfully"
    };

    return new Response(JSON.stringify(deletedRatingDto), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in DELETE /api/recipes/[id]/rating:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      // Check for rating not found error
      if (error.message.includes("Rating not found")) {
        return new Response(JSON.stringify({ error: "Rating not found for this recipe" }), {
          status: 404,
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
