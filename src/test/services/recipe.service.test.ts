import { describe, it, expect, beforeEach, vi } from "vitest";
import { RecipeService } from "../../lib/services/recipe.service";
import type { SupabaseClient } from "../../db/supabase.client";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClient;

describe("RecipeService", () => {
  let recipeService: RecipeService;

  beforeEach(() => {
    recipeService = new RecipeService(mockSupabase);
    vi.clearAllMocks();
  });

  describe("getRecipe", () => {
    it("should retrieve a recipe successfully", async () => {
      const mockRecipe = {
        id: "recipe-123",
        title: "Test Recipe",
        ingredients: JSON.stringify(["ingredient 1", "ingredient 2"]),
        shopping_list: JSON.stringify(["item 1", "item 2"]),
        instructions: JSON.stringify(["step 1", "step 2"]),
        query: "Test query",
        is_visible: true,
        user_id: "user-123",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockRecipe, error: null })
          })
        })
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await recipeService.getRecipe("recipe-123", "user-123");

      expect(result).toEqual({
        ...mockRecipe,
        ingredients: ["ingredient 1", "ingredient 2"],
        shopping_list: ["item 1", "item 2"],
        instructions: ["step 1", "step 2"]
      });
      expect(mockSupabase.from).toHaveBeenCalledWith("recipes");
    });

    it("should return null when recipe not found", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: null, 
              error: { code: "PGRST116" } 
            })
          })
        })
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await recipeService.getRecipe("recipe-123", "user-123");

      expect(result).toBeNull();
    });

    it("should throw error on database error", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: null, 
              error: { message: "Database error" } 
            })
          })
        })
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      await expect(recipeService.getRecipe("recipe-123", "user-123"))
        .rejects.toThrow("Database error");
    });
  });

  describe("updateVisibility", () => {
    it("should update recipe visibility successfully", async () => {
      const mockUpdatedRecipe = {
        id: "recipe-123",
        is_visible: false,
        updated_at: "2024-01-01T00:00:00Z"
      };

      // Mock the update response
      const mockUpdateResponse = { data: mockUpdatedRecipe, error: null };
      
      // Mock the single method to return the response
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockUpdateResponse)
              })
            })
          })
        })
      } as any);

      const result = await recipeService.updateVisibility("recipe-123", "user-123", false);

      expect(result).toEqual(mockUpdatedRecipe);
    });
  });

  describe("getRecipes", () => {
    it("should return paginated recipes with ratings", async () => {
      const mockRecipes = [
        { id: "recipe-1", title: "Recipe 1", created_at: "2024-01-01T00:00:00Z", is_visible: true },
        { id: "recipe-2", title: "Recipe 2", created_at: "2024-01-02T00:00:00Z", is_visible: true }
      ];

      const mockRatings = [
        { recipe_id: "recipe-1", rating: "up" },
        { recipe_id: "recipe-2", rating: "down" }
      ];

      // Create a mock query builder that handles all the chaining properly
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockRecipes, error: null })
      };

      // Mock the first call to supabase.from (for recipes query - building the query)
      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockQueryBuilder as any);

      // Mock the second call to supabase.from (for count query)
      const mockCountQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 2, error: null })
        })
      };
      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockCountQuery as any);

      // Mock the third call to supabase.from (for ratings query)
      const mockRatingsQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: mockRatings, error: null })
          })
        })
      };
      vi.mocked(mockSupabase.from).mockReturnValueOnce(mockRatingsQuery as any);

      const result = await recipeService.getRecipes("user-123", 1, 10, false, "created_at.desc");

      expect(result.recipes).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.recipes[0].user_rating).toBe("up");
      expect(result.recipes[1].user_rating).toBe("down");
    });
  });
});
