import { z } from "zod";

/**
 * Zod schemas for recipe API validation.
 * 
 * These schemas ensure that all incoming data is properly validated
 * before processing, providing type safety and consistent error messages.
 */

/**
 * Schema for generating a new recipe.
 * @see POST /api/recipes/generate
 */
export const generateRecipeSchema = z.object({
  query: z.string()
    .min(1, "Recipe query is required")
    .max(1000, "Recipe query must be less than 1000 characters")
    .trim(),
  model: z.string()
    .optional()
    .refine(
      (val) => !val || ["gpt-4", "gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"].includes(val),
      "Invalid AI model specified"
    )
});

/**
 * Schema for updating recipe visibility.
 * @see PUT /api/recipes/{id}/visibility
 */
export const updateRecipeVisibilitySchema = z.object({
  is_visible: z.boolean({
    required_error: "Visibility status is required",
    invalid_type_error: "Visibility must be a boolean value"
  })
});

/**
 * Schema for pagination query parameters.
 * @see GET /api/recipes
 */
export const recipeListQuerySchema = z.object({
  page: z.coerce.number()
    .int("Page must be an integer")
    .min(1, "Page must be at least 1")
    .default(1),
  limit: z.coerce.number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
  visible_only: z.union([
    z.boolean(),
    z.string().transform((val) => val === 'true')
  ])
    .optional()
    .default(false),
  sort: z.enum([
    "created_at.asc",
    "created_at.desc",
    "created_at_asc",
    "created_at_desc", 
    "title.asc",
    "title.desc",
    "title_asc",
    "title_desc"
  ])
    .optional()
    .default("created_at_desc")
});

/**
 * Schema for recipe ID path parameter.
 * Used in multiple endpoints that require a recipe ID.
 */
export const recipeIdSchema = z.string()
  .uuid("Invalid recipe ID format")
  .min(1, "Recipe ID is required");

/**
 * Type exports for use in API endpoints.
 */
export type GenerateRecipeInput = z.infer<typeof generateRecipeSchema>;
export type UpdateRecipeVisibilityInput = z.infer<typeof updateRecipeVisibilitySchema>;
export type RecipeListQueryInput = z.infer<typeof recipeListQuerySchema>;
export type RecipeIdInput = z.infer<typeof recipeIdSchema>;
