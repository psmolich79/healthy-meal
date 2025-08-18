import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Profile, UpdatedProfileDto, DeletedProfileDto } from "../../types";

// Import API functions
import { GET, PUT, DELETE } from "../../pages/api/profiles/me";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
} as any;

// Mock locals
const mockLocals = {
  user: { id: "user-123", email: "test@example.com" },
  supabase: mockSupabase,
};

const mockLocalsUnauthorized = {
  user: undefined,
  supabase: {} as any,
};

describe("/api/profiles/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("should return profile when user is authenticated and profile exists", async () => {
      const mockProfile: Profile = {
        user_id: "user-123",
        preferences: ["vegetarian", "gluten-free"],
        status: "active",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        status_changed_at: "2024-01-01T00:00:00Z",
      };

      // Mock supabase.from() response
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }),
      });
      mockSupabase.from = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const response = await GET({ locals: mockLocals } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        user_id: "user-123",
        preferences: ["vegetarian", "gluten-free"],
        status: "active",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      });
    });

    it("should return 401 when user is not authenticated", async () => {
      const response = await GET({ locals: mockLocalsUnauthorized } as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 404 when profile is not found", async () => {
      // Mock supabase.from() response for profile not found
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: "PGRST116" },
          }),
        }),
      });
      mockSupabase.from = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const response = await GET({ locals: mockLocals } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Profile not found");
    });

    it("should return 500 on internal server error", async () => {
      // Mock supabase.from() response for database error
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        }),
      });
      mockSupabase.from = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const response = await GET({ locals: mockLocals } as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("PUT", () => {
    it("should update preferences successfully", async () => {
      const mockUpdatedProfile: UpdatedProfileDto = {
        user_id: "user-123",
        preferences: ["vegan", "organic"],
        status: "active",
        updated_at: "2024-01-01T00:00:00Z",
      };

      // Mock supabase.from() response for update
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUpdatedProfile,
              error: null,
            }),
          }),
        }),
      });
      mockSupabase.from = vi.fn().mockReturnValue({
        update: mockUpdate,
      });

      const request = new Request("http://localhost/api/profiles/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: ["vegan", "organic"] }),
      });

      const response = await PUT({ request, locals: mockLocals } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUpdatedProfile);
    });

    it("should return 401 when user is not authenticated", async () => {
      const request = new Request("http://localhost/api/profiles/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: ["vegan"] }),
      });

      const response = await PUT({ request, locals: mockLocalsUnauthorized } as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 when request body is invalid JSON", async () => {
      const request = new Request("http://localhost/api/profiles/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: "invalid json",
      });

      const response = await PUT({ request, locals: mockLocals } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid JSON in request body");
    });

    it("should return 400 when preferences validation fails", async () => {
      const request = new Request("http://localhost/api/profiles/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: [] }),
      });

      const response = await PUT({ request, locals: mockLocals } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
      expect(data.details).toBeDefined();
    });

    it("should return 404 when profile is not found", async () => {
      // Mock supabase.from() response for profile not found
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      });
      mockSupabase.from = vi.fn().mockReturnValue({
        update: mockUpdate,
      });

      const request = new Request("http://localhost/api/profiles/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: ["vegan"] }),
      });

      const response = await PUT({ request, locals: mockLocals } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Profile not found");
    });
  });

  describe("DELETE", () => {
    it("should schedule deletion successfully", async () => {
      const mockProfile: Profile = {
        user_id: "user-123",
        preferences: ["vegetarian"],
        status: "pending_deletion",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        status_changed_at: "2024-01-01T00:00:00Z",
      };

      // Mock supabase.from() response for deletion
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });
      mockSupabase.from = vi.fn().mockReturnValue({
        update: mockUpdate,
      });

      const response = await DELETE({ locals: mockLocals } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "Profile scheduled for deletion",
        status: "pending_deletion",
        deletion_scheduled_at: "2024-01-01T00:00:00Z",
      });
    });

    it("should return 401 when user is not authenticated", async () => {
      const response = await DELETE({ locals: mockLocalsUnauthorized } as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 404 when profile is not found", async () => {
      // Mock supabase.from() response for profile not found
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      });
      mockSupabase.from = vi.fn().mockReturnValue({
        update: mockUpdate,
      });

      const response = await DELETE({ locals: mockLocals } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Profile not found");
    });
  });
});
