import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../../pages/api/recipes/[id]/regenerate";
import { createMockContext, mockUser, mockRecipe } from "../setup";

// Mock services
vi.mock("../../../../lib/services/recipe.service");
vi.mock("../../../../lib/services/ai.service");

const mockRecipeService = {
  getRecipe: vi.fn(),
  updateRecipe: vi.fn(),
};

const mockAiService = {
  regenerateRecipe: vi.fn(),
};

describe("/api/recipes/[id]/regenerate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    vi.mocked(mockRecipeService.getRecipe).mockResolvedValue(mockRecipe);
    vi.mocked(mockRecipeService.updateRecipe).mockResolvedValue(mockRecipe);
    vi.mocked(mockAiService.regenerateRecipe).mockResolvedValue({
      title: "Regenerated Recipe",
      ingredients: "Regenerated ingredients",
      shopping_list: "Regenerated shopping list",
      instructions: "Regenerated instructions",
      query: "Regenerated query"
    });
  });

  describe("POST", () => {
    it("should regenerate recipe successfully", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4" })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe("Test Recipe");
      expect(data.updated_at).toBeDefined();
    });

    it("should return 401 when user is not authenticated", async () => {
      const mockContext = createMockContext({
        locals: {
          user: undefined,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4" })
      });

      const response = await POST({ ...mockContext, request });
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

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4" })
      });

      const response = await POST({ ...mockContext, request });
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

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json"
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid JSON in request body");
    });

    it("should return 404 when recipe is not found", async () => {
      vi.mocked(mockRecipeService.getRecipe).mockResolvedValue(null);

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "non-existent-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/non-existent-id/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4" })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Recipe not found");
    });

    it("should return 403 when user is not the recipe owner", async () => {
      const otherUserRecipe = {
        ...mockRecipe,
        user_id: "other-user-id"
      };
      vi.mocked(mockRecipeService.getRecipe).mockResolvedValue(otherUserRecipe);

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4" })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Access denied");
    });

    it("should handle AI service errors gracefully", async () => {
      vi.mocked(mockAiService.regenerateRecipe).mockRejectedValue(
        new Error("AI service error")
      );

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4" })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should handle recipe update errors gracefully", async () => {
      vi.mocked(mockRecipeService.updateRecipe).mockRejectedValue(
        new Error("Database error")
      );

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4" })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should accept optional model parameter", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-3.5-turbo" })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
    });

    it("should work without model parameter", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
    });
  });
});
