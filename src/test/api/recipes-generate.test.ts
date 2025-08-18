import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../../pages/api/recipes/generate";
import { createMockContext, mockUser, mockRecipe } from "../setup";

// Mock services
vi.mock("../../../lib/services/recipe.service");
vi.mock("../../../lib/services/profile.service");
vi.mock("../../../lib/services/ai.service");

const mockRecipeService = {
  createRecipe: vi.fn(),
};

const mockProfileService = {
  getProfile: vi.fn(),
};

const mockAiService = {
  generateRecipe: vi.fn(),
};

describe("/api/recipes/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    vi.mocked(mockRecipeService.createRecipe).mockResolvedValue(mockRecipe);
    vi.mocked(mockProfileService.getProfile).mockResolvedValue({
      user_id: mockUser.id,
      preferences: ["vegetarian", "gluten-free"],
      status: "active",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      status_changed_at: "2024-01-01T00:00:00Z",
    });
    vi.mocked(mockAiService.generateRecipe).mockResolvedValue({
      title: "Test Recipe",
      ingredients: "Test ingredients",
      shopping_list: "Test shopping list",
      instructions: "Test instructions",
      query: "Test query",
    });
  });

  describe("POST", () => {
    it("should generate and save a recipe successfully", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
        },
      });

      const request = new Request("http://localhost:3000/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "vegetarian pasta" }),
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("id");
      expect(data.title).toBe("Test Recipe");
    });

    it("should return 401 when user is not authenticated", async () => {
      const mockContext = createMockContext({
        locals: {
          user: undefined,
          supabase: {},
        },
      });

      const request = new Request("http://localhost:3000/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "vegetarian pasta" }),
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Musisz być zalogowany, aby generować przepisy");
    });

    it("should return 400 for invalid JSON in request body", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
        },
      });

      const request = new Request("http://localhost:3000/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json",
      });

      const response = await POST({ ...mockContext, request });
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
      });

      const request = new Request("http://localhost:3000/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Missing required query field
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
      expect(data.details).toBeDefined();
    });

    it("should return 404 when user profile is not found", async () => {
      vi.mocked(mockProfileService.getProfile).mockResolvedValue(null);

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
        },
      });

      const request = new Request("http://localhost:3000/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "vegetarian pasta" }),
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User profile not found");
    });

    it("should handle AI service errors gracefully", async () => {
      vi.mocked(mockAiService.generateRecipe).mockRejectedValue(new Error("AI service error"));

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
        },
      });

      const request = new Request("http://localhost:3000/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "vegetarian pasta" }),
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should handle recipe creation errors gracefully", async () => {
      vi.mocked(mockRecipeService.createRecipe).mockRejectedValue(new Error("Database error"));

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
        },
      });

      const request = new Request("http://localhost:3000/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "vegetarian pasta" }),
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
          supabase: {},
        },
      });

      const request = new Request("http://localhost:3000/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "vegetarian pasta",
          model: "gpt-4",
        }),
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("id");
    });
  });
});
