import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, PUT, DELETE } from "../../pages/api/recipes/[id]/rating";
import { createMockContext, mockUser, mockRecipe, mockRating } from "../setup";

// Mock services
vi.mock("../../../../lib/services/rating.service");
vi.mock("../../../../lib/services/recipe.service");

const mockRatingService = {
  addRating: vi.fn(),
  updateRating: vi.fn(),
  deleteRating: vi.fn(),
};

const mockRecipeService = {
  getRecipe: vi.fn(),
};

describe("/api/recipes/[id]/rating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    vi.mocked(mockRatingService.addRating).mockResolvedValue({
      rating: "up",
      recipe_id: "test-recipe-id",
      user_id: mockUser.id
    });
    vi.mocked(mockRatingService.updateRating).mockResolvedValue({
      rating: "down",
      recipe_id: "test-recipe-id",
      user_id: mockUser.id
    });
    vi.mocked(mockRatingService.deleteRating).mockResolvedValue(true);
    vi.mocked(mockRecipeService.getRecipe).mockResolvedValue(mockRecipe);
  });

  describe("POST", () => {
    it("should add rating successfully", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: "up" })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Rating added successfully");
      expect(data.rating).toBe("up");
    });

    it("should return 401 when user is not authenticated", async () => {
      const mockContext = createMockContext({
        locals: {
          user: undefined,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: "up" })
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

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: "up" })
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

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json"
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
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: "invalid" })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid rating data");
      expect(data.details).toBeDefined();
    });

    it("should handle service errors gracefully", async () => {
      vi.mocked(mockRatingService.addRating).mockResolvedValue(null);

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {},
          authenticatedSupabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: "up" })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to add rating");
    });
  });

  describe("PUT", () => {
    it("should update rating successfully", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/rating", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: "down" })
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.rating).toBe("down");
    });

    it("should return 401 when user is not authenticated", async () => {
      const mockContext = createMockContext({
        locals: {
          user: undefined,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/rating", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: "down" })
      });

      const response = await PUT({ ...mockContext, request });
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

      const request = new Request("http://localhost:3000/api/recipes/invalid-id/rating", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: "down" })
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid recipe ID");
    });

    it("should return 404 when recipe is not found", async () => {
      vi.mocked(mockRecipeService.getRecipe).mockResolvedValue(null);

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/rating", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: "down" })
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Recipe not found or access denied");
    });

    it("should handle service errors gracefully", async () => {
      vi.mocked(mockRatingService.updateRating).mockResolvedValue(null);

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const request = new Request("http://localhost:3000/api/recipes/test-recipe-id/rating", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: "down" })
      });

      const response = await PUT({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to update rating");
    });
  });

  describe("DELETE", () => {
    it("should delete rating successfully", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const response = await DELETE(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Rating deleted successfully");
    });

    it("should return 401 when user is not authenticated", async () => {
      const mockContext = createMockContext({
        locals: {
          user: undefined,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const response = await DELETE(mockContext);
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

      const response = await DELETE(mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid recipe ID");
    });

    it("should return 404 when recipe is not found", async () => {
      vi.mocked(mockRecipeService.getRecipe).mockResolvedValue(null);

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const response = await DELETE(mockContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Recipe not found or access denied");
    });

    it("should handle service errors gracefully", async () => {
      vi.mocked(mockRatingService.deleteRating).mockResolvedValue(false);

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const response = await DELETE(mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to delete rating");
    });
  });
});
