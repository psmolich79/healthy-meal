import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfileService } from "../../lib/services/profile.service";
import type { SupabaseClient } from "../../db/supabase.client";
import type { Profile, UpdatedProfileDto } from "../../types";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClient;

describe("ProfileService", () => {
  let profileService: ProfileService;

  beforeEach(() => {
    profileService = new ProfileService(mockSupabase);
    vi.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return profile when found", async () => {
      const mockProfile: Profile = {
        user_id: "user-123",
        preferences: ["vegetarian", "gluten-free"],
        status: "active",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        status_changed_at: "2024-01-01T00:00:00Z"
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
        })
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        select: mockSelect
      });

      const result = await profileService.getProfile("user-123");

      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockSelect).toHaveBeenCalledWith("*");
    });

    it("should return null when profile not found", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: null, 
            error: { code: "PGRST116" } 
          })
        })
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        select: mockSelect
      });

      const result = await profileService.getProfile("user-123");

      expect(result).toBeNull();
    });

    it("should throw error on database error", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: null, 
            error: { message: "Database error" } 
          })
        })
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        select: mockSelect
      });

      await expect(profileService.getProfile("user-123")).rejects.toThrow();
    });
  });

  describe("updatePreferences", () => {
    it("should update preferences successfully", async () => {
      const mockUpdatedProfile: UpdatedProfileDto = {
        user_id: "user-123",
        preferences: ["vegan", "organic"],
        status: "active",
        updated_at: "2024-01-01T00:00:00Z"
      };

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: mockUpdatedProfile, 
              error: null 
            })
          })
        })
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        update: mockUpdate
      });

      const result = await profileService.updatePreferences("user-123", ["vegan", "organic"]);

      expect(result).toEqual(mockUpdatedProfile);
      expect(mockUpdate).toHaveBeenCalledWith({
        preferences: ["vegan", "organic"],
        updated_at: expect.any(String)
      });
    });

    it("should return null when profile not found", async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: null, 
              error: { code: "PGRST116" } 
            })
          })
        })
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        update: mockUpdate
      });

      const result = await profileService.updatePreferences("user-123", ["vegan"]);

      expect(result).toBeNull();
    });
  });

  describe("scheduleDeletion", () => {
    it("should schedule deletion successfully", async () => {
      const mockProfile: Profile = {
        user_id: "user-123",
        preferences: ["vegetarian"],
        status: "pending_deletion",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        status_changed_at: "2024-01-01T00:00:00Z"
      };

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: mockProfile, 
              error: null 
            })
          })
        })
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        update: mockUpdate
      });

      const result = await profileService.scheduleDeletion("user-123");

      expect(result).toEqual(mockProfile);
      expect(mockUpdate).toHaveBeenCalledWith({
        status: "pending_deletion",
        status_changed_at: expect.any(String),
        updated_at: expect.any(String)
      });
    });

    it("should return null when profile not found", async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: null, 
              error: { code: "PGRST116" } 
            })
          })
        })
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        update: mockUpdate
      });

      const result = await profileService.scheduleDeletion("user-123");

      expect(result).toBeNull();
    });
  });
});
