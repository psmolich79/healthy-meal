import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, DELETE } from "../../pages/api/recipes/[id]/save";
import { createMockContext, mockUser, mockRecipe } from "../setup";

// Mock RecipeService
vi.mock("../../../../lib/services/recipe.service");

const mockRecipeService = {
  saveRecipe: vi.fn(),
  unsaveRecipe: vi.fn(),
  isRecipeSaved: vi.fn(),
};

describe("/api/recipes/[id]/save", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    vi.mocked(mockRecipeService.saveRecipe).mockResolvedValue(true);
    vi.mocked(mockRecipeService.unsaveRecipe).mockResolvedValue(true);
    vi.mocked(mockRecipeService.isRecipeSaved).mockResolvedValue(true);
  });

  describe("POST", () => {
    it("should save recipe successfully", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const response = await POST(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Recipe saved successfully");
    });

    it("should return 401 when user is not authenticated", async () => {
      const mockContext = createMockContext({
        locals: {
          user: undefined,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const response = await POST(mockContext);
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

      const response = await POST(mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Recipe ID is required");
    });

    it("should return 404 when recipe is not found", async () => {
      vi.mocked(mockRecipeService.saveRecipe).mockResolvedValue(false);

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "non-existent-id" }
      });

      const response = await POST(mockContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Recipe not found");
    });

    it("should handle service errors gracefully", async () => {
      vi.mocked(mockRecipeService.saveRecipe).mockRejectedValue(
        new Error("Service error")
      );

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const response = await POST(mockContext);
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
          supabase: {}
        },
        params: { id: "test-recipe-id" }
      });

      const response = await DELETE(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Recipe unsaved successfully");
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

    it("should return 400 when recipe ID is missing", async () => {
      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: {}
      });

      const response = await DELETE(mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Recipe ID is required");
    });

    it("should return 404 when recipe is not found", async () => {
      vi.mocked(mockRecipeService.unsaveRecipe).mockResolvedValue(false);

      const mockContext = createMockContext({
        locals: {
          user: mockUser,
          supabase: {}
        },
        params: { id: "non-existent-id" }
      });

      const response = await DELETE(mockContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Recipe not found");
    });

    it("should handle service errors gracefully", async () => {
      vi.mocked(mockRecipeService.unsaveRecipe).mockRejectedValue(
        new Error("Service error")
      );

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
      expect(data.error).toBe("Internal server error");
    });
  });
});
