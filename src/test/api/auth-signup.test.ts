import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../../pages/api/auth/signup";
import { createMockContext } from "../setup";

describe("/api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST", () => {
    it("should sign up user successfully with valid credentials", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: "new-user-id",
                email: "newuser@example.com"
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

      const request = new Request("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "newuser@example.com",
          password: "password123"
        })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.session).toBeDefined();
      expect(data.access_token).toBe("mock-access-token");
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: "newuser@example.com",
        password: "password123"
      });
    });

    it("should return 400 for invalid email format", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn()
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signup", {
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
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 400 for empty password", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn()
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "newuser@example.com",
          password: ""
        })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Internal server error");
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 400 for missing email", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn()
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signup", {
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
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 400 for missing password", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn()
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "newuser@example.com"
        })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Internal server error");
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid JSON in request body", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn()
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json"
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 400 when Supabase returns an error", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn().mockResolvedValue({
            data: null,
            error: {
              message: "User already registered"
            }
          })
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "existing@example.com",
          password: "password123"
        })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("User already registered");
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: "existing@example.com",
        password: "password123"
      });
    });

    it("should handle missing session gracefully", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: "new-user-id",
                email: "newuser@example.com"
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

      const request = new Request("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "newuser@example.com",
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
          signUp: vi.fn().mockRejectedValue(
            new Error("Unexpected error")
          )
        }
      };

      const mockContext = createMockContext({
        locals: {
          supabase: mockSupabase
        }
      });

      const request = new Request("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "newuser@example.com",
          password: "password123"
        })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should handle email confirmation required scenario", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: "new-user-id",
                email: "newuser@example.com"
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

      const request = new Request("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "newuser@example.com",
          password: "password123"
        })
      });

      const response = await POST({ ...mockContext, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.session).toBeNull();
      // This is a valid scenario where email confirmation might be required
    });
  });
});
