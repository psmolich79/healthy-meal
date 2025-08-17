import type { SupabaseClient } from "../../db/supabase.client";
import type { 
  Recipe, 
  Profile, 
  AiGenerationLog, 
  Rating,
  GeneratedRecipeDto,
  RecipeDetailsDto,
  RegeneratedRecipeDto,
  UpdatedRecipeVisibilityDto,
  RecipeListItemDto,
  PaginatedRecipesDto,
  PaginationDto
} from "../../types";

/**
 * Service for managing recipe operations.
 * 
 * This service provides a clean interface for all recipe-related database operations,
 * including recipe generation, retrieval, visibility updates, and regeneration.
 * It handles error cases gracefully and provides detailed logging for debugging.
 * 
 * @example
 * ```typescript
 * const recipeService = new RecipeService(supabaseClient);
 * const recipe = await recipeService.getRecipe(recipeId, userId);
 * ```
 */
export class RecipeService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Retrieves a recipe by ID and validates ownership.
   * @param recipeId - The ID of the recipe to retrieve
   * @param userId - The ID of the user requesting the recipe
   * @returns Promise resolving to the recipe details DTO or null if not found
   */
  async getRecipe(recipeId: string, userId: string): Promise<RecipeDetailsDto | null> {
    try {
      const { data, error } = await this.supabase
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null;
        }
        throw error;
      }

      // Get user rating for this recipe
      const userRating = await this.getUserRating(recipeId, userId);

      // Check if recipe is saved by user
      const isSaved = await this.isRecipeSaved(recipeId, userId);

      // Extract data from content JSONB column and create RecipeDetailsDto
      const recipeDetailsDto: RecipeDetailsDto = {
        ...data,
        ingredients: data.content?.ingredients || [],
        shopping_list: data.content?.shopping_list || [],
        instructions: data.content?.instructions || [],
        is_saved: isSaved,
        user_rating: userRating?.rating || null
      };

      return recipeDetailsDto;
    } catch (error) {
      console.error("Error retrieving recipe:", error);
      throw error;
    }
  }

  /**
   * Gets user rating for a specific recipe.
   * @param recipeId - The ID of the recipe
   * @param userId - The ID of the user
   * @returns Promise resolving to the rating or null if not found
   */
  async getUserRating(recipeId: string, userId: string): Promise<Rating | null> {
    try {
      const { data, error } = await this.supabase
        .from("ratings")
        .select("*")
        .eq("recipe_id", recipeId)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error retrieving user rating:", error);
      throw error;
    }
  }

  /**
   * Updates the visibility of a recipe.
   * @param recipeId - The ID of the recipe to update
   * @param userId - The ID of the user requesting the update
   * @param isVisible - The new visibility status
   * @returns Promise resolving to the updated recipe data or null if update failed
   */
  async updateVisibility(
    recipeId: string, 
    userId: string, 
    isVisible: boolean
  ): Promise<UpdatedRecipeVisibilityDto | null> {
    try {
      const { data, error } = await this.supabase
        .from("recipes")
        .update({ 
          is_visible: isVisible,
          updated_at: new Date().toISOString()
        })
        .eq("id", recipeId)
        .eq("user_id", userId)
        .select("id, is_visible, updated_at")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error updating recipe visibility:", error);
      throw error;
    }
  }

  /**
   * Gets a paginated list of recipes for a user.
   * @param userId - The ID of the user
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @param visibleOnly - Whether to show only visible recipes
   * @param sort - Sort order
   * @returns Promise resolving to paginated recipes
   */
  async getRecipes(
    userId: string,
    page: number = 1,
    limit: number = 10,
    visibleOnly: boolean = false,
    sort: string = "created_at.desc"
  ): Promise<PaginatedRecipesDto> {
    try {
      // Calculate offset
      const offset = (page - 1) * limit;

      // Build query
      let query = this.supabase
        .from("recipes")
        .select("id, title, created_at, is_visible")
        .eq("user_id", userId);

      // Apply visibility filter
      if (visibleOnly) {
        query = query.eq("is_visible", true);
      }

      // Get total count with proper filtering
      let countQuery = this.supabase
        .from("recipes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (visibleOnly) {
        countQuery = countQuery.eq("is_visible", true);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        throw countError;
      }

      // Convert sort parameter to database column format and direction
      let sortColumn: string;
      let sortDirection: 'asc' | 'desc';
      
      if (sort.includes('created_at')) {
        sortColumn = 'created_at';
        sortDirection = sort.includes('desc') ? 'desc' : 'asc';
      } else if (sort.includes('title')) {
        sortColumn = 'title';
        sortDirection = sort.includes('desc') ? 'desc' : 'asc';
      } else {
        // Default sorting
        sortColumn = 'created_at';
        sortDirection = 'desc';
      }
      
      // Get recipes with pagination and sorting
      const { data: recipes, error } = await query
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      // Get user ratings and saved status for all recipes
      const recipeIds = recipes.map(r => r.id);
      const [ratingsResult, savedResult] = await Promise.all([
        this.supabase
          .from("ratings")
          .select("recipe_id, rating")
          .eq("user_id", userId)
          .in("recipe_id", recipeIds),
        this.supabase
          .from("saved_recipes")
          .select("recipe_id")
          .eq("user_id", userId)
          .in("recipe_id", recipeIds)
      ]);

      // Create rating and saved lookup maps
      const ratingMap = new Map(
        ratingsResult.data?.map(r => [r.recipe_id, r.rating]) || []
      );
      const savedMap = new Set(
        savedResult.data?.map(r => r.recipe_id) || []
      );

      // Transform to RecipeListItemDto
      const recipeListItems: RecipeListItemDto[] = recipes.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        created_at: recipe.created_at,
        is_visible: recipe.is_visible,
        user_rating: ratingMap.get(recipe.id) || null,
        is_saved: savedMap.has(recipe.id)
      }));

      // Calculate pagination metadata
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      const pagination: PaginationDto = {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1
      };

      return {
        recipes: recipeListItems,
        pagination
      };
    } catch (error) {
      console.error("Error retrieving recipes:", error);
      throw error;
    }
  }

  /**
   * Gets user profile for recipe generation.
   * @param userId - The ID of the user
   * @returns Promise resolving to the profile or null if not found
   */
  async getUserProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error retrieving user profile:", error);
      throw error;
    }
  }

  /**
   * Saves a recipe to user's favorites.
   * @param recipeId - The ID of the recipe to save
   * @param userId - The ID of the user
   * @returns Promise resolving to true if successful, false otherwise
   */
  async saveRecipe(recipeId: string, userId: string): Promise<boolean> {
    try {
      // Check if recipe is already saved
      const isAlreadySaved = await this.isRecipeSaved(recipeId, userId);
      if (isAlreadySaved) {
        console.log(`Recipe ${recipeId} is already saved for user ${userId}`);
        return true; // Already saved, consider it successful
      }

      const { error } = await this.supabase
        .from("saved_recipes")
        .insert({
          user_id: userId,
          recipe_id: recipeId
        });

      if (error) {
        console.error("Error saving recipe:", error);
        return false;
      }

      console.log(`Recipe ${recipeId} saved for user ${userId}`);
      return true;
    } catch (error) {
      console.error("Error saving recipe:", error);
      return false;
    }
  }

  /**
   * Removes a recipe from user's favorites.
   * @param recipeId - The ID of the recipe to unsave
   * @param userId - The ID of the user
   * @returns Promise resolving to true if successful, false otherwise
   */
  async unsaveRecipe(recipeId: string, userId: string): Promise<boolean> {
    try {
      // Check if recipe is saved
      const isSaved = await this.isRecipeSaved(recipeId, userId);
      if (!isSaved) {
        console.log(`Recipe ${recipeId} is not saved for user ${userId}`);
        return true; // Not saved, consider it successful
      }

      const { error } = await this.supabase
        .from("saved_recipes")
        .delete()
        .eq("user_id", userId)
        .eq("recipe_id", recipeId);

      if (error) {
        console.error("Error unsaving recipe:", error);
        return false;
      }

      console.log(`Recipe ${recipeId} unsaved for user ${userId}`);
      return true;
    } catch (error) {
      console.error("Error unsaving recipe:", error);
      return false;
    }
  }

  /**
   * Checks if a recipe is saved by the user.
   * @param recipeId - The ID of the recipe to check
   * @param userId - The ID of the user
   * @returns Promise resolving to true if saved, false otherwise
   */
  async isRecipeSaved(recipeId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from("saved_recipes")
        .select("id")
        .eq("user_id", userId)
        .eq("recipe_id", recipeId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned - recipe is not saved
          return false;
        }
        console.error("Error checking if recipe is saved:", error);
        return false;
      }

      return !!data; // Return true if data exists
    } catch (error) {
      console.error("Error checking if recipe is saved:", error);
      return false;
    }
  }
}
