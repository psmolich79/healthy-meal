import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT } from "../../pages/api/recipes/[id]/visibility";
import { createMockContext, mockUser, mockRecipe } from "../setup";

// Mock RecipeService
vi.mock("../../../../lib/services/recipe.service");

const mockRecipeService = {
  updateRecipeVisibility: vi.fn(),
};

describe("/api/recipes/[id]/visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    vi.mocked(mockRecipeService.updateRecipeVisibility).mockResolvedValue({
      ...mockRecipe,
      is_visible: false
    });
  });

  describe("PUT", () => {
    it("should update recipe visibility successfully", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: false })
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.is_visible).toBe(false);
    });

    it("should return 401 when user is not authenticated", async () => {
      const mockContext = createMockContext({
        locals: {
          user: undefined,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: false })
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
          supabase: {}
        },
        params: {}
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: false })
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
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: "invalid json"
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
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}) // Missing required is_visible field
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
      expect(data.details).toBeDefined();
    });

    it("should return 404 when recipe is not found", async () => {
      vi.mocked(mockRecipeService.updateRecipeVisibility).mockResolvedValue(null);

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "non-existent-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/non-existent-id/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: false })
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Recipe not found");
    });

    it("should handle service errors gracefully", async () => {
      vi.mocked(mockRecipeService.updateRecipeVisibility).mockRejectedValue(
        new Error("Service error")
      );

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: false })
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should accept true value for visibility", async () => {
      vi.mocked(mockRecipeService.updateRecipeVisibility).mockResolvedValue({
        ...mockRecipe,
        is_visible: true
      });

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: true })
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.is_visible).toBe(true);
    });
  });
});
