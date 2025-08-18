import { describe, it, expect, vi, beforeEach } from "vitest";
import { RatingService } from "../../lib/services/rating.service";
import type { SupabaseClient } from "../../db/supabase.client";
import type { Rating } from "../../types";

// Mock data
const mockRating: Rating = {
  id: "rating-123",
  recipe_id: "recipe-123",
  user_id: "user-123",
  rating: 1, // up rating
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockRatingWithCanRegenerate = {
  ...mockRating,
  can_regenerate: false, // up rating (1) should not allow regeneration
};

const updatedRating: Rating = {
  id: "rating-123",
  recipe_id: "recipe-123",
  user_id: "user-123",
  rating: -1, // down rating
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-02T00:00:00Z",
};

const updatedRatingWithCanRegenerate = {
  ...updatedRating,
  can_regenerate: true, // down rating (-1) should allow regeneration
};

describe("RatingService", () => {
  let ratingService: RatingService;
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create fresh mock for each test
    mockSupabase = {
      from: vi.fn(),
      auth: {
        getUser: vi.fn(),
      },
    };
    
    ratingService = new RatingService(mockSupabase as any);
  });

  describe("createRating", () => {
    it("should create a rating successfully", async () => {
      // Mock getRating to return null (no existing rating)
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockRating, error: null }),
        }),
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect }) // for getRating
        .mockReturnValueOnce({ insert: mockInsert }); // for insert

      const result = await ratingService.createRating("recipe-123", "user-123", 1);

      expect(result).toEqual(mockRatingWithCanRegenerate);
      expect(mockSupabase.from).toHaveBeenCalledWith("ratings");
    });

    it("should throw error when rating already exists", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockRating, error: null }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(
        ratingService.createRating("recipe-123", "user-123", 1)
      ).rejects.toThrow("Rating already exists for this recipe");
    });

    it("should handle database errors gracefully", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        }),
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ insert: mockInsert });

      await expect(
        ratingService.createRating("recipe-123", "user-123", 1)
      ).rejects.toThrow("Database error");
    });
  });

  describe("updateRating", () => {
    it("should update a rating successfully", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockRating, error: null }),
          }),
        }),
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedRating, error: null }),
            }),
          }),
        }),
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ update: mockUpdate });

      const result = await ratingService.updateRating("recipe-123", "user-123", -1);

      expect(result).toEqual(updatedRatingWithCanRegenerate);
      expect(mockSupabase.from).toHaveBeenCalledWith("ratings");
    });

    it("should handle rating not found", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(
        ratingService.updateRating("recipe-123", "user-123", -1)
      ).rejects.toThrow("Rating not found");
    });
  });

  describe("deleteRating", () => {
    it("should delete a rating successfully", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockRating, error: null }),
          }),
        }),
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            error: null,
          }),
        }),
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ delete: mockDelete });

      const result = await ratingService.deleteRating("recipe-123", "user-123");

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("ratings");
    });

    it("should handle rating not found", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(
        ratingService.deleteRating("recipe-123", "user-123")
      ).rejects.toThrow("Rating not found");
    });
  });

  describe("getRating", () => {
    it("should retrieve a rating successfully", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockRating, error: null }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await ratingService.getRating("recipe-123", "user-123");

      expect(result).toEqual(mockRating);
      expect(mockSupabase.from).toHaveBeenCalledWith("ratings");
    });

    it("should return null when rating not found", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await ratingService.getRating("recipe-123", "user-123");

      expect(result).toBeNull();
    });
  });

  describe("upsertRating", () => {
    it("should update existing rating successfully", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockRating, error: null }),
          }),
        }),
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedRating, error: null }),
            }),
          }),
        }),
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ update: mockUpdate });

      const result = await ratingService.upsertRating("recipe-123", "user-123", -1);

      expect(result).toEqual(updatedRatingWithCanRegenerate);
    });

    it("should throw error when update fails", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockRating, error: null }),
          }),
        }),
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Update failed" },
              }),
            }),
          }),
        }),
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ update: mockUpdate });

      await expect(
        ratingService.upsertRating("recipe-123", "user-123", -1)
      ).rejects.toThrow("Update failed");
    });
  });
});
