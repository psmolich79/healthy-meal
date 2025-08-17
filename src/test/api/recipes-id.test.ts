import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../../pages/api/recipes/[id]";
import { createMockContext, mockUser, mockRecipe } from "../setup";

// Mock RecipeService
vi.mock("../../../lib/services/recipe.service");

const mockRecipeService = {
  getRecipe: vi.fn(),
  getUserRating: vi.fn(),
};

describe("/api/recipes/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    vi.mocked(mockRecipeService.getRecipe).mockResolvedValue(mockRecipe);
    vi.mocked(mockRecipeService.getUserRating).mockResolvedValue(null);
  });

  describe("GET", () => {
    it("should return recipe details successfully", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe("test-recipe-id");
      expect(data.title).toBe("Test Recipe");
    });

    it("should return 401 when user is not authenticated", async () => {
      const mockContext = createMockContext({
        locals: {
          user: undefined,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 when recipe ID is invalid", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "invalid-id" }
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid recipe ID");
    });

    it("should return 404 when recipe is not found", async () => {
      vi.mocked(mockRecipeService.getRecipe).mockResolvedValue(null);

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {}
        },
        params: { id: "non-existent-id" }
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Recipe not found");
    });

    it("should handle JWT authentication errors", async () => {
      vi.mocked(mockRecipeService.getRecipe).mockRejectedValue(
        new Error("JWT token expired")
      );

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid authentication token");
    });

    it("should handle permission/RLS errors", async () => {
      vi.mocked(mockRecipeService.getRecipe).mockRejectedValue(
        new Error("RLS policy violation")
      );

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Access denied");
    });

    it("should handle service errors gracefully", async () => {
      vi.mocked(mockRecipeService.getRecipe).mockRejectedValue(
        new Error("Service error")
      );

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should include user rating when available", async () => {
      vi.mocked(mockRecipeService.getUserRating).mockResolvedValue({
        rating: "up",
        recipe_id: "test-recipe-id",
        user_id: mockUser.id
      });

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user_rating).toBe("up");
    });
  });
});
