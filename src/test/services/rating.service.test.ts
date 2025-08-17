import { describe, it, expect, beforeEach, vi } from "vitest";
import { RatingService } from "../../lib/services/rating.service";
import type { SupabaseClient } from "../../db/supabase.client";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClient;

describe("RatingService", () => {
  let ratingService: RatingService;

  beforeEach(() => {
    ratingService = new RatingService(mockSupabase);
    vi.clearAllMocks();
  });

  describe("createRating", () => {
    it("should create a rating successfully", async () => {
      const mockRating = {
        recipe_id: "recipe-123",
        user_id: "user-123",
        rating: "up" as const,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      };

      // Mock getRating to return null (no existing rating)
      const mockGetRating = vi.fn().mockResolvedValue(null);

      // Mock insert operation
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockRating, error: null })
        })
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        insert: mockInsert
      } as any);

      // Mock the getRating method
      vi.spyOn(ratingService, 'getRating').mockImplementation(mockGetRating);

      const result = await ratingService.createRating("recipe-123", "user-123", "up");

      expect(result).toEqual({
        ...mockRating,
        can_regenerate: false // up rating should not allow regeneration
      });
      expect(mockInsert).toHaveBeenCalledWith({
        recipe_id: "recipe-123",
        user_id: "user-123",
        rating: "up",
        created_at: expect.any(String),
        updated_at: expect.any(String)
      });
    });

    it("should throw error when rating already exists", async () => {
      const existingRating = {
        recipe_id: "recipe-123",
        user_id: "user-123",
        rating: "down",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      };

      // Mock getRating to return existing rating
      vi.spyOn(ratingService, 'getRating').mockResolvedValue(existingRating);

      await expect(ratingService.createRating("recipe-123", "user-123", "up"))
        .rejects.toThrow("Rating already exists for this recipe");
    });

    it("should throw error on database error", async () => {
      // Mock getRating to return null
      vi.spyOn(ratingService, 'getRating').mockResolvedValue(null);

      // Mock insert operation to fail
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: "Database error" })
        })
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        insert: mockInsert
      } as any);

      await expect(ratingService.createRating("recipe-123", "user-123", "up"))
        .rejects.toThrow("Database error");
    });
  });

  describe("updateRating", () => {
    it("should update a rating successfully", async () => {
      const existingRating = {
        recipe_id: "recipe-123",
        user_id: "user-123",
        rating: "up",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      };

      // Mock getRating to return existing rating
      vi.spyOn(ratingService, 'getRating').mockResolvedValue(existingRating);

      const updatedRating = {
        ...existingRating,
        rating: "down",
        updated_at: "2024-01-02T00:00:00Z"
      };

      // Mock update operation
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: updatedRating, error: null })
              })
            })
          })
        })
      } as any);

      const result = await ratingService.updateRating("recipe-123", "user-123", "down");

      expect(result).toEqual({
        ...updatedRating,
        can_regenerate: true // down rating should allow regeneration
      });
    });

    it("should throw error when rating not found", async () => {
      // Mock getRating to return null
      vi.spyOn(ratingService, 'getRating').mockResolvedValue(null);

      await expect(ratingService.updateRating("recipe-123", "user-123", "down"))
        .rejects.toThrow("Rating not found");
    });
  });

  describe("deleteRating", () => {
    it("should delete a rating successfully", async () => {
      const existingRating = {
        recipe_id: "recipe-123",
        user_id: "user-123",
        rating: "up" as const,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      };

      // Mock getRating to return existing rating
      vi.spyOn(ratingService, 'getRating').mockResolvedValue(existingRating);

      // Mock delete operation
      vi.mocked(mockSupabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              error: null
            })
          })
        })
      } as any);

      const result = await ratingService.deleteRating("recipe-123", "user-123");

      expect(result).toBe(true);
    });

    it("should throw error when rating not found", async () => {
      // Mock getRating to return null
      vi.spyOn(ratingService, 'getRating').mockResolvedValue(null);

      await expect(ratingService.deleteRating("recipe-123", "user-123"))
        .rejects.toThrow("Rating not found");
    });
  });

  describe("getRating", () => {
    it("should retrieve a rating successfully", async () => {
      const mockRating = {
        recipe_id: "recipe-123",
        user_id: "user-123",
        rating: "up" as const,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      };

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockRating, error: null })
            })
          })
        })
      } as any);

      const result = await ratingService.getRating("recipe-123", "user-123");

      expect(result).toEqual(mockRating);
      expect(mockSupabase.from).toHaveBeenCalledWith("ratings");
    });

    it("should return null when rating not found", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ 
                data: null, 
                error: { code: "PGRST116" } 
              })
            })
          })
        })
      } as any);

      const result = await ratingService.getRating("recipe-123", "user-123");

      expect(result).toBeNull();
    });
  });

  describe("upsertRating", () => {
    it("should update existing rating", async () => {
      const existingRating = {
        recipe_id: "recipe-123",
        user_id: "user-123",
        rating: "up",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      };

      const updatedRating = {
        ...existingRating,
        rating: "down",
        updated_at: "2024-01-01T12:00:00Z"
      };

      // Mock updateRating to succeed
      vi.spyOn(ratingService, 'updateRating').mockResolvedValue({
        ...updatedRating,
        can_regenerate: true
      });

      const result = await ratingService.upsertRating("recipe-123", "user-123", "down");

      expect(result).toEqual({
        ...updatedRating,
        can_regenerate: true
      });
      expect(ratingService.updateRating).toHaveBeenCalledWith("recipe-123", "user-123", "down");
    });

    it("should create new rating when update fails", async () => {
      const newRating = {
        recipe_id: "recipe-123",
        user_id: "user-123",
        rating: "up",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      };

      // Mock updateRating to fail (return null)
      vi.spyOn(ratingService, 'updateRating').mockResolvedValue(null);

      // Mock createRating to succeed
      vi.spyOn(ratingService, 'createRating').mockResolvedValue({
        ...newRating,
        can_regenerate: false
      });

      const result = await ratingService.upsertRating("recipe-123", "user-123", "up");

      expect(result).toEqual({
        ...newRating,
        can_regenerate: false
      });
      expect(ratingService.createRating).toHaveBeenCalledWith("recipe-123", "user-123", "up");
    });
  });

  describe("transformToUpsertRatingDto", () => {
    it("should set can_regenerate to true for down rating", async () => {
      const rating = {
        recipe_id: "recipe-123",
        user_id: "user-123",
        rating: "down" as const,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      };

      // Access private method through reflection for testing
      const transformToUpsertRatingDto = (ratingService as any).transformToUpsertRatingDto;
      
      const result = transformToUpsertRatingDto(rating);

      expect(result.can_regenerate).toBe(true);
    });

    it("should set can_regenerate to false for up rating", async () => {
      const rating = {
        recipe_id: "recipe-123",
        user_id: "user-123",
        rating: "up" as const,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      };

      // Access private method through reflection for testing
      const transformToUpsertRatingDto = (ratingService as any).transformToUpsertRatingDto;
      
      const result = transformToUpsertRatingDto(rating);

      expect(result.can_regenerate).toBe(false);
    });
  });
});
