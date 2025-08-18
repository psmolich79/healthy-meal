import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT } from "../../pages/api/recipes/[id]/visibility";
import { createMockContext, mockUser, mockRecipe } from "../setup";

// Mock services zgodnie z planem implementacji
vi.mock("../../../lib/services/recipe.service");

const mockRecipeService = {
  getRecipe: vi.fn(),
  updateVisibility: vi.fn(),
};

describe("/api/recipes/[id]/visibility", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset mock implementations
    vi.mocked(mockRecipeService.getRecipe).mockResolvedValue(mockRecipe);
    vi.mocked(mockRecipeService.updateVisibility).mockResolvedValue({
      ...mockRecipe,
      is_visible: true,
    });

    // Mock service constructors
    vi.doMock("../../../lib/services/recipe.service", () => ({
      RecipeService: vi.fn().mockImplementation(() => mockRecipeService),
    }));
  });

  describe("PUT", () => {
    it("should update recipe visibility successfully", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: { id: mockRecipe.id },
      });

      const request = new Request(`http://localhost:3000/api/recipes/${mockRecipe.id}/visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: true }),
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Recipe visibility updated successfully");
      expect(data.recipe.is_visible).toBe(true);
    });

    it("should return 401 when user is not authenticated", async () => {
      const mockContext = createMockContext({
        locals: {
          user: undefined,
          supabase: {},
        },
        params: { id: mockRecipe.id },
      });

      const request = new Request(`http://localhost:3000/api/recipes/${mockRecipe.id}/visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: true }),
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 when recipe ID is missing", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
        },
        params: {},
      });

      const request = new Request("http://localhost:3000/api/recipes//visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: true }),
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Recipe ID is required");
    });

    it("should return 400 for invalid JSON in request body", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
        },
        params: { id: mockRecipe.id },
      });

      const request = new Request(`http://localhost:3000/api/recipes/${mockRecipe.id}/visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: "invalid json",
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid JSON in request body");
    });

    it("should return 400 for validation errors", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
        },
        params: { id: mockRecipe.id },
      });

      const request = new Request(`http://localhost:3000/api/recipes/${mockRecipe.id}/visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: "invalid" }),
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid visibility value");
    });

    it("should return 404 when recipe is not found", async () => {
      vi.mocked(mockRecipeService.getRecipe).mockResolvedValue(null);

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
        },
        params: { id: "non-existent" },
      });

      const request = new Request("http://localhost:3000/api/recipes/non-existent/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: true }),
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Recipe not found");
    });

    it("should handle service errors gracefully", async () => {
      vi.mocked(mockRecipeService.updateVisibility).mockRejectedValue(new Error("Service error"));

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
        },
        params: { id: mockRecipe.id },
      });

      const request = new Request(`http://localhost:3000/api/recipes/${mockRecipe.id}/visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: true }),
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to update recipe visibility");
    });

    it("should accept true value for visibility", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: { id: mockRecipe.id },
      });

      const request = new Request(`http://localhost:3000/api/recipes/${mockRecipe.id}/visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: true }),
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recipe.is_visible).toBe(true);
    });

    it("should accept false value for visibility", async () => {
      vi.mocked(mockRecipeService.updateVisibility).mockResolvedValue({
        ...mockRecipe,
        is_visible: false,
      });

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: { id: mockRecipe.id },
      });

      const request = new Request(`http://localhost:3000/api/recipes/${mockRecipe.id}/visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: false }),
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recipe.is_visible).toBe(false);
    });
  });
});
