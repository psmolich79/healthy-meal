import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../../pages/api/auth/signin";
import { createMockContext } from "../setup";

describe("/api/auth/signin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST", () => {
    it("should sign in user successfully with valid credentials", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: "test-user-id",
                email: "test@example.com"
              },
              session: {
                access_token: "mock-access-token",
                refresh_token: "mock-refresh-token"
              }
            },
            error: null
          })
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123"
        })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.session).toBeDefined();
      expect(data.access_token).toBe("mock-access-token");
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123"
      });
    });

    it("should return 400 for invalid email format", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn()
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid-email",
          password: "password123"
        })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Internal server error");
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should return 400 for empty password", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn()
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: ""
        })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Internal server error");
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should return 400 for missing email", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn()
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: "password123"
        })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Internal server error");
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should return 400 for missing password", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn()
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com"
        })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Internal server error");
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid JSON in request body", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn()
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json"
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should return 400 when Supabase returns an error", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: null,
            error: {
              message: "Invalid credentials"
            }
          })
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpassword"
        })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid credentials");
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "wrongpassword"
      });
    });

    it("should handle missing session gracefully", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: "test-user-id",
                email: "test@example.com"
              },
              session: null
            },
            error: null
          })
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123"
        })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.session).toBeNull();
      expect(data.access_token).toBeUndefined();
    });

    it("should handle unexpected errors gracefully", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockRejectedValue(
            new Error("Unexpected error")
          )
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123"
        })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });
});
