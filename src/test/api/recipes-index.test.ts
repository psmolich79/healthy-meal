import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../../pages/api/recipes/index";
import { createMockContext, mockUser, mockRecipe } from "../setup";

// Mock RecipeService zgodnie z planem implementacji
vi.mock("../../../lib/services/recipe.service");

const mockRecipeService = {
  getRecipes: vi.fn(),
  getSavedRecipes: vi.fn(),
};

describe("/api/recipes", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset mock implementations
    vi.mocked(mockRecipeService.getRecipes).mockResolvedValue({
      recipes: [mockRecipe],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
    vi.mocked(mockRecipeService.getSavedRecipes).mockResolvedValue([mockRecipe]);

    // Mock service constructors
    vi.doMock("../../../lib/services/recipe.service", () => ({
      RecipeService: vi.fn().mockImplementation(() => mockRecipeService),
    }));
  });

  describe("GET", () => {
    it("should return paginated recipes successfully", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: {},
        url: new URL("http://localhost:3000/api/recipes?page=1&limit=10"),
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recipes).toHaveLength(1);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.total).toBe(1);
    });

    it("should return 401 when user is not authenticated", async () => {
      const mockContext = createMockContext({
        locals: {
          user: undefined,
          supabase: {},
        },
        params: {},
        url: new URL("http://localhost:3000/api/recipes"),
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should use default query parameters when none provided", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: {},
        url: new URL("http://localhost:3000/api/recipes"),
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recipes).toBeDefined();
    });

    it("should handle custom query parameters correctly", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: {},
        url: new URL("http://localhost:3000/api/recipes?page=2&limit=5&sort=title.asc"),
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recipes).toBeDefined();
    });

    it("should handle visible_only parameter", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: {},
        url: new URL("http://localhost:3000/api/recipes?visible_only=true"),
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recipes).toBeDefined();
    });

    it("should handle invalid page parameter", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: {},
        url: new URL("http://localhost:3000/api/recipes?page=invalid"),
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid page parameter");
    });

    it("should handle invalid limit parameter", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: {},
        url: new URL("http://localhost:3000/api/recipes?limit=invalid"),
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid limit parameter");
    });

    it("should handle limit exceeding maximum", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: {},
        url: new URL("http://localhost:3000/api/recipes?limit=150"),
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Limit cannot exceed 100");
    });

    it("should handle JWT authentication errors", async () => {
      vi.mocked(mockRecipeService.getRecipes).mockRejectedValue(new Error("JWT token expired"));

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: {},
        url: new URL("http://localhost:3000/api/recipes"),
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid authentication token");
    });

    it("should handle permission/RLS errors", async () => {
      vi.mocked(mockRecipeService.getRecipes).mockRejectedValue(new Error("Access denied"));

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: {},
        url: new URL("http://localhost:3000/api/recipes"),
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Access denied");
    });

    it("should handle service errors gracefully", async () => {
      vi.mocked(mockRecipeService.getRecipes).mockRejectedValue(new Error("Service error"));

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: {},
        url: new URL("http://localhost:3000/api/recipes"),
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should include saved status for recipes", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: {},
        url: new URL("http://localhost:3000/api/recipes"),
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recipes[0]).toHaveProperty("is_saved");
    });

    it("should handle empty results", async () => {
      vi.mocked(mockRecipeService.getRecipes).mockResolvedValue({
        recipes: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: {},
        url: new URL("http://localhost:3000/api/recipes"),
      });

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recipes).toHaveLength(0);
      expect(data.pagination.total).toBe(0);
    });
  });
});
