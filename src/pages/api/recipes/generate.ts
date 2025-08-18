import type { APIRoute } from "astro";
import { RecipeService } from "../../../lib/services/recipe.service";
import { ProfileService } from "../../../lib/services/profile.service";
import { AiService } from "../../../lib/services/ai.service";
import { generateRecipeSchema } from "../../../lib/schemas/recipe.schemas";
import type { GeneratedRecipeDto } from "../../../types";
import { createClient } from "@supabase/supabase-js";

/**
 * API endpoint for generating new AI-powered recipes.
 *
 * This endpoint processes user queries and generates personalized recipes
 * based on user preferences and dietary requirements.
 *
 * @see {@link RecipeService} for business logic implementation
 * @see {@link AiService} for AI generation
 * @see {@link GeneratedRecipeDto} for response type
 */

// Disable prerendering for this API route
export const prerender = false;

/**
 * POST /api/recipes/generate
 * Generates a new recipe based on user query and preferences.
 *
 * @param request - The incoming request with generation parameters
 * @param locals - Local context including user and supabase client
 * @returns Generated recipe or error response
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    console.log("POST /api/recipes/generate - Starting request");

    // Get user and supabase client from middleware
    const { user, supabase } = locals;

    console.log("POST /api/recipes/generate - user from locals:", user);

    if (!user?.id) {
      console.log("POST /api/recipes/generate - No user found in locals");
      return new Response(JSON.stringify({ error: "Musisz być zalogowany, aby generować przepisy" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("User from locals:", user.id);

    // Parse and validate request body
    let body: { query: string; model?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate request body using Zod
    const validationResult = generateRecipeSchema.safeParse(body);
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

    const { query, model } = validationResult.data;

    // Create service instances using authenticated client (respects RLS)
    const recipeService = new RecipeService(supabase);
    const profileService = new ProfileService(supabase);
    const aiService = new AiService(supabase);

    // Get user profile for preferences
    console.log("Getting user profile for user:", user.id);
    const userProfile = await profileService.getProfile(user.id);
    if (!userProfile) {
      console.log("User profile not found for user:", user.id);
      return new Response(JSON.stringify({ error: "User profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.log("User profile found with preferences:", userProfile.preferences);

    // Generate recipe using AI service
    const aiResult = await aiService.generateRecipe(query, userProfile.preferences, user.id, model);

    // Store the generated recipe in the database using authenticated client (RLS)
    console.log("Storing recipe with authenticated client for RLS...");
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        title: aiResult.title,
        content: {
          ingredients: aiResult.ingredients,
          shopping_list: aiResult.shopping_list,
          instructions: aiResult.instructions,
        },
        query: query,
        preferences: userProfile.preferences,
        is_visible: true,
        user_id: user.id,
      })
      .select()
      .single();

    if (recipeError) {
      console.error("Error storing recipe:", recipeError);
      throw new Error("Failed to store generated recipe");
    }

    // Store AI usage log using authenticated client (RLS)
    console.log("Storing AI usage with authenticated client for RLS...");
    await supabase.from("ai_usage").insert({
      user_id: user.id,
      model: aiResult.aiGeneration.model || "gpt-4o",
      input_tokens: aiResult.aiGeneration.input_tokens,
      output_tokens: aiResult.aiGeneration.output_tokens,
      cost: aiResult.aiGeneration.cost,
    });

    // Transform to GeneratedRecipeDto
    const generatedRecipeDto: GeneratedRecipeDto = {
      id: recipe.id,
      title: recipe.title,
      ingredients: (recipe.content as any).ingredients,
      shopping_list: (recipe.content as any).shopping_list,
      instructions: (recipe.content as any).instructions,
      initial_user_query: recipe.query,
      is_visible: recipe.is_visible,
      created_at: recipe.created_at,
      user_preferences_applied: userProfile.preferences,
      ai_generation: {
        model: aiResult.aiGeneration.model || "gpt-4",
        input_tokens: aiResult.aiGeneration.input_tokens,
        output_tokens: aiResult.aiGeneration.output_tokens,
        cost: aiResult.aiGeneration.cost,
      },
    };

    return new Response(JSON.stringify(generatedRecipeDto), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/recipes/generate:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for rate limiting
      if (error.message.includes("Rate limit exceeded")) {
        return new Response(JSON.stringify({ error: "Too many generation requests" }), {
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
        return new Response(JSON.stringify({ error: "Recipe generation failed" }), {
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
