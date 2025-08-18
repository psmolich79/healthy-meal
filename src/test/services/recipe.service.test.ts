import { describe, it, expect, beforeEach, vi } from "vitest";
import { RecipeService } from "../../lib/services/recipe.service";
import type { SupabaseClient } from "../../db/supabase.client";

// Mock data
const mockRecipe = {
  id: "recipe-123",
  title: "Test Recipe",
  query: "Test query",
  user_id: "user-123",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  is_visible: true,
  ingredients: [],
  instructions: [],
  shopping_list: [],
  is_saved: true,
  user_rating: null,
};

// Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn(),
          order: vi.fn().mockReturnValue({
            range: vi.fn(),
          }),
        }),
        single: vi.fn(),
        order: vi.fn().mockReturnValue({
          range: vi.fn(),
        }),
      }),
      order: vi.fn().mockReturnValue({
        range: vi.fn(),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn(),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn(),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn(),
    }),
  }),
  auth: {
    getUser: vi.fn(),
  },
} as unknown as SupabaseClient;

describe("RecipeService", () => {
  let recipeService: RecipeService;

  beforeEach(() => {
    vi.clearAllMocks();
    recipeService = new RecipeService(mockSupabase);
  });

  describe("getRecipe", () => {
    it("should retrieve a recipe successfully", async () => {
      // Mock successful select
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockRecipe, error: null }),
            }),
          }),
        }),
      } as any);

      const result = await recipeService.getRecipe("recipe-123", "user-123");

      expect(result).toEqual(mockRecipe);
    });

    it("should return null when recipe not found", async () => {
      // Mock no rows returned
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: "PGRST116" },
              }),
            }),
          }),
        }),
      } as any);

      const result = await recipeService.getRecipe("recipe-123", "user-123");

      expect(result).toBeNull();
    });

    it("should throw error on database error", async () => {
      // Mock database error
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Database error" },
              }),
            }),
          }),
        }),
      } as any);

      await expect(recipeService.getRecipe("recipe-123", "user-123")).rejects.toThrow("Database error");
    });
  });

  describe("updateVisibility", () => {
    it("should update recipe visibility successfully", async () => {
      // Mock successful update
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: { 
                    id: "recipe-123", 
                    is_visible: false, 
                    updated_at: "2024-01-01T00:00:00Z" 
                  }, 
                  error: null 
                }),
              }),
            }),
          }),
        }),
      } as any);

      const result = await recipeService.updateVisibility("recipe-123", "user-123", false);

      expect(result).toEqual({ id: "recipe-123", is_visible: false, updated_at: expect.any(String) });
    });
  });


});
