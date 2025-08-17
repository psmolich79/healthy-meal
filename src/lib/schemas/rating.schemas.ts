import { z } from "zod";

/**
 * Zod schemas for recipe rating API validation.
 * 
 * These schemas ensure that all incoming data is properly validated
 * before processing, providing type safety and consistent error messages.
 */

/**
 * Schema for creating or updating a recipe rating.
 * @see POST /api/recipes/{id}/rating
 * @see PUT /api/recipes/{id}/rating
 */
export const upsertRatingSchema = z.object({
  rating: z.enum(["up", "down"], {
    required_error: "Rating is required",
    invalid_type_error: "Rating must be either 'up' or 'down'"
  }).transform((val) => val === "up" ? 1 : -1)
});

/**
 * Schema for recipe ID path parameter.
 * Used in rating endpoints that require a recipe ID.
 */
export const recipeIdSchema = z.string()
  .uuid("Invalid recipe ID format")
  .min(1, "Recipe ID is required");

/**
 * Type exports for use in API endpoints.
 */
export type UpsertRatingInput = z.infer<typeof upsertRatingSchema>;
export type RecipeIdInput = z.infer<typeof recipeIdSchema>;
