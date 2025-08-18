import type { APIRoute } from "astro";
import { RecipeService } from "../../../../lib/services/recipe.service";
import { AiService } from "../../../../lib/services/ai.service";
import { ApiUsageService } from "../../../../lib/services/api-usage.service";
import { recipeIdSchema } from "../../../../lib/schemas/recipe.schemas";
import type { RegeneratedRecipeDto } from "../../../../types";

/**
 * API endpoint for regenerating a recipe.
 *
 * This endpoint allows users to regenerate a recipe based on the original query
 * and user preferences. It creates a new recipe with a reference to the original.
 *
 * @see {@link RecipeService} for business logic implementation
 * @see {@link AiService} for AI generation
 * @see {@link RegeneratedRecipeDto} for response type
 */

// Disable prerendering for this API route
export const prerender = false;

/**
 * POST /api/recipes/{id}/regenerate
 * Regenerates a recipe based on the original query and user preferences.
 *
 * @param params - URL parameters including recipe ID
 * @param locals - Local context including user and supabase client
 * @returns Regenerated recipe or error response
 */
export const POST: APIRoute = async ({ params, locals }) => {
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

    // Create service instances
    const recipeService = new RecipeService(supabase);
    const aiService = new AiService(supabase);
    const apiUsageService = new ApiUsageService(supabase);

    // Check API usage limits before proceeding
    console.log("Checking API usage limits for regeneration, user:", user.id);
    const usageCheck = await apiUsageService.checkProfileApiKeyLimit(user.id);
    
    if (!usageCheck.canProceed) {
      const resetTime = new Date(usageCheck.limits.reset_time).toLocaleString("pl-PL");
      return new Response(
        JSON.stringify({ 
          error: "Dzienny limit generowania przepisów został wyczerpany",
          details: {
            daily_limit: usageCheck.limits.daily_limit,
            current_usage: usageCheck.limits.current_usage,
            reset_time: resetTime,
            tip: "Dodaj własny klucz API w profilu, aby generować przepisy bez ograniczeń"
          }
        }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the original recipe to validate ownership and extract data
    const originalRecipe = await recipeService.getRecipe(recipeId, user.id);
    if (!originalRecipe) {
      return new Response(JSON.stringify({ error: "Recipe not found or access denied" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user profile for preferences
    const userProfile = await recipeService.getUserProfile(user.id);
    if (!userProfile) {
      return new Response(JSON.stringify({ error: "User profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate regenerated recipe using AI service
    const aiResult = await aiService.generateRecipe(
      originalRecipe.query,
      userProfile.preferences,
      user.id,
      "gpt-4" // Use default model for regeneration
    );

    // Store the regenerated recipe in the database
    const { data: regeneratedRecipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        title: aiResult.title,
        content: {
          ingredients: aiResult.ingredients,
          shopping_list: aiResult.shopping_list,
          instructions: aiResult.instructions,
        },
        query: originalRecipe.query,
        preferences: userProfile.preferences,
        is_visible: true,
        user_id: user.id,
      })
      .select()
      .single();

    if (recipeError) {
      console.error("Error storing regenerated recipe:", recipeError);
      throw new Error("Failed to store regenerated recipe");
    }

    // Log API usage for rate limiting
    console.log("Logging API usage for regeneration...");
    await apiUsageService.logUsage({
      user_id: user.id,
      api_key_id: aiResult.userApiKeyId, // Use user's API key ID if available
      endpoint: "/api/recipes/[id]/regenerate",
      tokens_used: (aiResult.aiGeneration.input_tokens || 0) + (aiResult.aiGeneration.output_tokens || 0),
      cost_usd: aiResult.aiGeneration.cost,
      ip_address: undefined, // No request object in this context
      user_agent: undefined,
    });

    // Transform to RegeneratedRecipeDto
    const regeneratedRecipeDto: RegeneratedRecipeDto = {
      id: regeneratedRecipe.id,
      title: regeneratedRecipe.title,
      ingredients: (regeneratedRecipe.content as any).ingredients,
      shopping_list: (regeneratedRecipe.content as any).shopping_list,
      instructions: (regeneratedRecipe.content as any).instructions,
      initial_user_query: regeneratedRecipe.query,
      regenerated_from_recipe_id: recipeId,
      is_visible: regeneratedRecipe.is_visible,
      created_at: regeneratedRecipe.created_at,
      ai_generation: {
        model: aiResult.aiGeneration.model || "gpt-4",
        input_tokens: aiResult.aiGeneration.input_tokens,
        output_tokens: aiResult.aiGeneration.output_tokens,
        cost: aiResult.aiGeneration.cost,
      },
      user_api_key_id: aiResult.userApiKeyId,
    };

    return new Response(JSON.stringify(regeneratedRecipeDto), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/recipes/[id]/regenerate:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for rate limiting
      if (error.message.includes("Rate limit exceeded")) {
        return new Response(JSON.stringify({ error: "Too many regeneration requests" }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        });
      }

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

      // Check for AI service errors
      if (error.message.includes("Recipe generation failed")) {
        return new Response(JSON.stringify({ error: "Recipe regeneration failed" }), {
          status: 500,
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
