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
  async createRating(
    recipeId: string, 
    userId: string, 
    rating: RatingType
  ): Promise<UpsertRatingDto | null> {
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
  async updateRating(
    recipeId: string, 
    userId: string, 
    rating: RatingType
  ): Promise<UpsertRatingDto | null> {
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
          updated_at: new Date().toISOString()
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
  async addRating(
    recipeId: string, 
    userId: string, 
    rating: RatingType
  ): Promise<{ rating: RatingType } | null> {
    try {
      // Use upsert to create or update rating
      const { data, error } = await this.supabase
        .from("ratings")
        .upsert({
          recipe_id: recipeId,
          user_id: userId,
          rating,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
      const { error } = await this.supabase
        .from("ratings")
        .delete()
        .eq("recipe_id", recipeId)
        .eq("user_id", userId);

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
  async upsertRating(
    recipeId: string, 
    userId: string, 
    rating: RatingType
  ): Promise<UpsertRatingDto> {
    try {
      // Try to update first
      const updatedRating = await this.updateRating(recipeId, userId, rating);
      if (updatedRating) {
        return updatedRating;
      }

      // If update failed, create new rating
      const createdRating = await this.createRating(recipeId, userId, rating);
      if (!createdRating) {
        throw new Error("Failed to create rating");
      }

      return createdRating;
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
      can_regenerate: rating.rating === -1 // Allow regeneration for negative ratings (-1 = down)
    };
  }
}
