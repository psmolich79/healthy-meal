import type { SupabaseClient } from "../../db/supabase.client";
import type { Rating, RatingType, UpsertRatingDto } from "../../types";

/**
 * Service for managing recipe ratings.
 *
 * This service provides a clean interface for all rating-related database operations,
 * including creating, updating, and deleting ratings with proper validation.
 *
 * @example
 * ```typescript
 * const ratingService = new RatingService(supabaseClient);
 * const rating = await ratingService.createRating(recipeId, userId, "up");
 * ```
 */
export class RatingService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Creates a new rating for a recipe.
   * @param recipeId - The ID of the recipe to rate
   * @param userId - The ID of the user creating the rating
   * @param rating - The rating value (up/down)
   * @returns Promise resolving to the created rating or null if creation failed
   */
  async createRating(recipeId: string, userId: string, rating: RatingType): Promise<UpsertRatingDto | null> {
    try {
      // Check if rating already exists
      const existingRating = await this.getRating(recipeId, userId);
      if (existingRating) {
        throw new Error("Rating already exists for this recipe");
      }

      // Create new rating
      const { data, error } = await this.supabase
        .from("ratings")
        .insert({
          recipe_id: recipeId,
          user_id: userId,
          rating,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Transform to UpsertRatingDto
      return this.transformToUpsertRatingDto(data);
    } catch (error) {
      console.error("Error creating rating:", error);
      throw error;
    }
  }

  /**
   * Updates an existing rating for a recipe.
   * @param recipeId - The ID of the recipe
   * @param userId - The ID of the user updating the rating
   * @param rating - The new rating value (up/down)
   * @returns Promise resolving to the updated rating or null if update failed
   */
  async updateRating(recipeId: string, userId: string, rating: RatingType): Promise<UpsertRatingDto | null> {
    try {
      // Check if rating exists
      const existingRating = await this.getRating(recipeId, userId);
      if (!existingRating) {
        throw new Error("Rating not found");
      }

      // Update rating
      const { data, error } = await this.supabase
        .from("ratings")
        .update({
          rating,
        })
        .eq("recipe_id", recipeId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Transform to UpsertRatingDto
      return this.transformToUpsertRatingDto(data);
    } catch (error) {
      console.error("Error updating rating:", error);
      throw error;
    }
  }

  /**
   * Adds or updates a rating for a recipe (upsert operation).
   * @param recipeId - The ID of the recipe to rate
   * @param userId - The ID of the user creating/updating the rating
   * @param rating - The rating value (1 for up, -1 for down)
   * @returns Promise resolving to the rating result or null if operation failed
   */
  async addRating(recipeId: string, userId: string, rating: RatingType): Promise<{ rating: RatingType } | null> {
    try {
      // Use upsert to create or update rating
      // Don't set created_at/updated_at - let database handle it
      const { data, error } = await this.supabase
        .from("ratings")
        .upsert({
          recipe_id: recipeId,
          user_id: userId,
          rating,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { rating: data.rating };
    } catch (error) {
      console.error("Error adding/updating rating:", error);
      return null;
    }
  }

  /**
   * Deletes a rating for a recipe.
   * @param recipeId - The ID of the recipe
   * @param userId - The ID of the user deleting the rating
   * @returns Promise resolving to true if deletion successful, false otherwise
   */
  async deleteRating(recipeId: string, userId: string): Promise<boolean> {
    try {
      // Check if rating exists
      const existingRating = await this.getRating(recipeId, userId);
      if (!existingRating) {
        throw new Error("Rating not found");
      }

      // Delete rating
      const { error } = await this.supabase.from("ratings").delete().eq("recipe_id", recipeId).eq("user_id", userId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error deleting rating:", error);
      throw error;
    }
  }

  /**
   * Gets a rating for a specific recipe and user.
   * @param recipeId - The ID of the recipe
   * @param userId - The ID of the user
   * @returns Promise resolving to the rating or null if not found
   */
  async getRating(recipeId: string, userId: string): Promise<Rating | null> {
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
      console.error("Error retrieving rating:", error);
      throw error;
    }
  }

  /**
   * Upserts a rating (creates if doesn't exist, updates if exists).
   * @param recipeId - The ID of the recipe
   * @param userId - The ID of the user
   * @param rating - The rating value (up/down)
   * @returns Promise resolving to the upserted rating
   */
  async upsertRating(recipeId: string, userId: string, rating: RatingType): Promise<UpsertRatingDto> {
    try {
      console.log(`Upserting rating: recipeId=${recipeId}, userId=${userId}, rating=${rating}`);
      
      // Use Supabase upsert for atomic operation
      // Don't set created_at/updated_at - let database handle it
      const { data, error } = await this.supabase
        .from("ratings")
        .upsert({
          recipe_id: recipeId,
          user_id: userId,
          rating,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase upsert error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          recipeId,
          userId,
          rating
        });
        
        // Log additional context for debugging
        console.error("Upsert context:", {
          table: "ratings",
          uniqueConstraint: "ratings_user_recipe_unique",
          columns: ["user_id", "recipe_id"],
          values: { user_id: userId, recipe_id: recipeId, rating }
        });
        
        // Check if it's a unique constraint violation
        if (error.code === "23505") {
          console.error("Unique constraint violation detected. This might indicate a race condition or duplicate key.");
        }
        
        // Check if it's a foreign key violation
        if (error.code === "23503") {
          console.error("Foreign key violation detected. This might indicate that the recipe or user doesn't exist.");
        }
        
        // Check if it's a check constraint violation
        if (error.code === "23514") {
          console.error("Check constraint violation detected. This might indicate an invalid rating value.");
        }
        
        // Check if it's a permission denied error
        if (error.code === "42501") {
          console.error("Permission denied. This might indicate an RLS policy issue.");
        }
        
        // Check if it's a not null violation
        if (error.code === "23502") {
          console.error("Not null violation detected. This might indicate a missing required field.");
        }
        
        throw error;
      }

      console.log("Upsert successful, data:", data);

      // Transform to UpsertRatingDto
      return this.transformToUpsertRatingDto(data);
    } catch (error) {
      console.error("Error upserting rating:", error);
      throw error;
    }
  }

  /**
   * Transforms a Rating to UpsertRatingDto with computed fields.
   * @param rating - The rating data from database
   * @returns UpsertRatingDto with can_regenerate flag
   */
  private transformToUpsertRatingDto(rating: Rating): UpsertRatingDto {
    return {
      ...rating,
      can_regenerate: rating.rating === "down", // Allow regeneration for negative ratings
    };
  }
}
