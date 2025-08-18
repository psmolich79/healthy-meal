import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, DELETE } from "../../pages/api/recipes/[id]/save";
import { createMockContext, mockUser, mockRecipe } from "../setup";

// Mock services
vi.mock("../../../lib/services/recipe.service", () => ({
  RecipeService: vi.fn(),
}));

// Mock service instances
const mockRecipeService = {
  getRecipe: vi.fn(),
  saveRecipe: vi.fn(),
  unsaveRecipe: vi.fn(),
};

describe("/api/recipes/[id]/save", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    vi.mocked(mockRecipeService.getRecipe).mockResolvedValue(mockRecipe);
    vi.mocked(mockRecipeService.saveRecipe).mockResolvedValue(true);
    vi.mocked(mockRecipeService.unsaveRecipe).mockResolvedValue(true);

    // Mock service constructors
    const { RecipeService } = require("../../../lib/services/recipe.service");
    vi.mocked(RecipeService).mockImplementation(() => mockRecipeService);
  });

  describe("POST", () => {
    it("should save recipe successfully", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: { id: mockRecipe.id },
      });

      const request = new Request(`http://localhost:3000/api/recipes/${mockRecipe.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Recipe saved successfully");
    });

    it("should return 401 when user is not authenticated", async () => {
      const mockContext = createMockContext({
        locals: {
          user: undefined,
          supabase: {},
        },
        params: { id: mockRecipe.id },
      });

      const request = new Request(`http://localhost:3000/api/recipes/${mockRecipe.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
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
          supabase: {},
          authenticatedSupabase: {},
        },
        params: {},
      });

      const request = new Request(`http://localhost:3000/api/recipes/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Recipe ID is required");
    });

    it("should return 404 when recipe is not found", async () => {
      vi.mocked(mockRecipeService.getRecipe).mockResolvedValue(null);

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: { id: mockRecipe.id },
      });

      const request = new Request(`http://localhost:3000/api/recipes/${mockRecipe.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Recipe not found");
    });

    it("should handle service errors gracefully", async () => {
      vi.mocked(mockRecipeService.saveRecipe).mockRejectedValue(new Error("Service error"));

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: { id: mockRecipe.id },
      });

      const request = new Request(`http://localhost:3000/api/recipes/${mockRecipe.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("DELETE", () => {
    it("should unsave recipe successfully", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: { id: mockRecipe.id },
      });

      const request = new Request(`http://localhost:3000/api/recipes/${mockRecipe.id}/save`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const response = await DELETE({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Recipe unsaved successfully");
    });

    it("should return 401 when user is not authenticated", async () => {
      const mockContext = createMockContext({
        locals: {
          user: undefined,
          supabase: {},
        },
        params: { id: mockRecipe.id },
      });

      const request = new Request(`http://localhost:3000/api/recipes/${mockRecipe.id}/save`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const response = await DELETE({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 when recipe ID is missing", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: {},
      });

      const request = new Request(`http://localhost:3000/api/recipes/save`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const response = await DELETE({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Recipe ID is required");
    });

    it("should return 404 when recipe is not found", async () => {
      vi.mocked(mockRecipeService.getRecipe).mockResolvedValue(null);

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: { id: mockRecipe.id },
      });

      const request = new Request(`http://localhost:3000/api/recipes/${mockRecipe.id}/save`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const response = await DELETE({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Recipe not found");
    });

    it("should handle service errors gracefully", async () => {
      vi.mocked(mockRecipeService.unsaveRecipe).mockRejectedValue(new Error("Service error"));

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {},
        },
        params: { id: mockRecipe.id },
      });

      const request = new Request(`http://localhost:3000/api/recipes/${mockRecipe.id}/save`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const response = await DELETE({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });
});
