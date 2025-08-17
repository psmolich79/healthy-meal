import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../../pages/api/recipes/index";
import { createMockContext, mockUser, mockRecipe } from "../setup";

// Mock RecipeService
vi.mock("../../../lib/services/recipe.service");

const mockRecipeService = {
  getRecipes: vi.fn(),
};

describe("/api/recipes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    vi.mocked(mockRecipeService.getRecipes).mockResolvedValue({
      recipes: [mockRecipe],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    });
  });

  describe("GET", () => {
    it("should return paginated recipes successfully", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        }
      });

      const request = new Request("http://localhost:3000/api/recipes?page=1&limit=10");
      const response = await GET({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recipes).toHaveLength(1);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });

    it("should return 401 when user is not authenticated", async () => {
      const mockContext = createMockContext({
        locals: {
          user: undefined,
          supabase: {}
        }
      });

      const request = new Request("http://localhost:3000/api/recipes");
      const response = await GET({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should use default query parameters when none provided", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        }
      });

      const request = new Request("http://localhost:3000/api/recipes");
      const response = await GET({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recipes).toBeDefined();
    });

    it("should handle custom query parameters correctly", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        }
      });

      const request = new Request(
        "http://localhost:3000/api/recipes?page=2&limit=20&visible_only=true&sort=title.asc"
      );
      const response = await GET({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recipes).toBeDefined();
    });

    it("should return 400 for invalid query parameters", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        }
      });

      const request = new Request("http://localhost:3000/api/recipes?page=invalid&limit=999");
      const response = await GET({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid query parameters");
      expect(data.details).toBeDefined();
    });

    it("should handle database errors gracefully", async () => {
      vi.mocked(mockRecipeService.getRecipes).mockRejectedValue(
        new Error("Database error")
      );

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        }
      });

      const request = new Request("http://localhost:3000/api/recipes");
      const response = await GET({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should handle JWT authentication errors", async () => {
      vi.mocked(mockRecipeService.getRecipes).mockRejectedValue(
        new Error("JWT token expired")
      );

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        }
      });

      const request = new Request("http://localhost:3000/api/recipes");
      const response = await GET({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid authentication token");
    });

    it("should handle permission/RLS errors", async () => {
      vi.mocked(mockRecipeService.getRecipes).mockRejectedValue(
        new Error("RLS policy violation")
      );

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        }
      });

      const request = new Request("http://localhost:3000/api/recipes");
      const response = await GET({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Access denied");
    });

    it("should handle unknown errors gracefully", async () => {
      vi.mocked(mockRecipeService.getRecipes).mockRejectedValue(
        new Error("Unknown error")
      );

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        }
      });

      const request = new Request("http://localhost:3000/api/recipes");
      const response = await GET({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });
});
