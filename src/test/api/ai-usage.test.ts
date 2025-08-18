import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIContext } from "astro";

// Mock the AiService
vi.mock("../../../lib/services/ai.service", () => ({
  AiService: vi.fn().mockImplementation(() => ({
    getAiUsage: vi.fn(),
  })),
}));

// Mock the validation schema
vi.mock("../../lib/schemas/ai-usage.schemas", () => ({
  aiUsageQuerySchema: {
    safeParse: vi.fn(),
  },
}));

// Import after mocking
import { GET } from "../../pages/api/ai/usage";
import { AiService } from "../../../lib/services/ai.service";
import { aiUsageQuerySchema } from "../../lib/schemas/ai-usage.schemas";

describe("GET /api/ai/usage", () => {
  let mockContext: APIContext;
  let mockAiService: any;
  let mockValidationResult: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock AiService instance
    mockAiService = {
      getAiUsage: vi.fn(),
    };
    vi.mocked(AiService).mockReturnValue(mockAiService);

    // Mock validation schema
    mockValidationResult = {
      success: true,
      data: {
        period: "month",
        start_date: undefined,
        end_date: undefined,
      },
    };
    vi.mocked(aiUsageQuerySchema.safeParse).mockReturnValue(mockValidationResult);

    // Mock context
    mockContext = {
      request: new Request("http://localhost:4321/api/ai/usage?period=month"),
      params: {},
      locals: {
        user: { id: "user-123" },
        supabase: {},
      },
    } as any;
  });

  describe("Authentication", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockContext.locals.user = null;

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });

    it("should return 401 when user ID is missing", async () => {
      mockContext.locals.user = {};

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });
  });

  describe("Query Parameter Validation", () => {
    it("should return 400 when validation fails", async () => {
      mockValidationResult.success = false;
      mockValidationResult.error = {
        errors: [{ message: "Invalid period" }],
      };

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Invalid query parameters");
      expect(body.details).toEqual([{ message: "Invalid period" }]);
    });

    it("should handle custom period validation", async () => {
      mockContext.request = new Request(
        "http://localhost:4321/api/ai/usage?period=custom&start_date=2024-01-01&end_date=2024-01-31"
      );
      mockValidationResult.data = {
        period: "custom",
        start_date: "2024-01-01T00:00:00Z",
        end_date: "2024-01-31T23:59:59Z",
      };

      mockAiService.getAiUsage.mockResolvedValue({
        period: "custom",
        start_date: "2024-01-01T00:00:00Z",
        end_date: "2024-01-31T23:59:59Z",
        total_generations: 5,
        total_input_tokens: 1000,
        total_output_tokens: 2000,
        total_cost: 0.15,
        models_used: { "gpt-4": { generations: 5, cost: 0.15 } },
        daily_breakdown: [],
      });

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.period).toBe("custom");
      expect(body.total_generations).toBe(5);
    });
  });

  describe("Successful Responses", () => {
    it("should return AI usage statistics for month period", async () => {
      const mockUsageData = {
        period: "month",
        start_date: "2024-01-01T00:00:00Z",
        end_date: "2024-01-31T23:59:59Z",
        total_generations: 10,
        total_input_tokens: 2000,
        total_output_tokens: 4000,
        total_cost: 0.3,
        models_used: {
          "gpt-4": { generations: 7, cost: 0.21 },
          "gpt-3.5-turbo": { generations: 3, cost: 0.09 },
        },
        daily_breakdown: [
          { date: "2024-01-15", generations: 3, cost: 0.09 },
          { date: "2024-01-16", generations: 2, cost: 0.06 },
        ],
      };

      mockAiService.getAiUsage.mockResolvedValue(mockUsageData);

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(mockUsageData);
      expect(mockAiService.getAiUsage).toHaveBeenCalledWith("user-123", "month", undefined, undefined);
    });

    it("should return AI usage statistics for custom period", async () => {
      mockContext.request = new Request(
        "http://localhost:4321/api/ai/usage?period=custom&start_date=2024-01-01&end_date=2024-01-15"
      );
      mockValidationResult.data = {
        period: "custom",
        start_date: "2024-01-01T00:00:00Z",
        end_date: "2024-01-15T23:59:59Z",
      };

      const mockUsageData = {
        period: "custom",
        start_date: "2024-01-01T00:00:00Z",
        end_date: "2024-01-15T23:59:59Z",
        total_generations: 5,
        total_input_tokens: 1000,
        total_output_tokens: 2000,
        total_cost: 0.15,
        models_used: { "gpt-4": { generations: 5, cost: 0.15 } },
        daily_breakdown: [],
      };

      mockAiService.getAiUsage.mockResolvedValue(mockUsageData);

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(mockUsageData);
      expect(mockAiService.getAiUsage).toHaveBeenCalledWith(
        "user-123",
        "custom",
        "2024-01-01T00:00:00Z",
        "2024-01-15T23:59:59Z"
      );
    });

    it("should handle empty usage data", async () => {
      const mockUsageData = {
        period: "week",
        start_date: "2024-01-08T00:00:00Z",
        end_date: "2024-01-15T23:59:59Z",
        total_generations: 0,
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_cost: null,
        models_used: {},
        daily_breakdown: [],
      };

      mockValidationResult.data.period = "week";
      mockAiService.getAiUsage.mockResolvedValue(mockUsageData);

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.total_generations).toBe(0);
      expect(body.total_cost).toBe(null);
    });
  });

  describe("Error Handling", () => {
    it("should handle custom period validation errors", async () => {
      mockContext.request = new Request("http://localhost:4321/api/ai/usage?period=custom");
      mockValidationResult.data = { period: "custom" };

      mockAiService.getAiUsage.mockRejectedValue(new Error("Custom period requires both start_date and end_date"));

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Custom period requires both start_date and end_date");
    });

    it("should handle invalid date range errors", async () => {
      mockContext.request = new Request(
        "http://localhost:4321/api/ai/usage?period=custom&start_date=2024-01-31&end_date=2024-01-01"
      );
      mockValidationResult.data = {
        period: "custom",
        start_date: "2024-01-31T00:00:00Z",
        end_date: "2024-01-01T00:00:00Z",
      };

      mockAiService.getAiUsage.mockRejectedValue(new Error("Start date must be before end date"));

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Start date must be before end date");
    });

    it("should handle invalid period errors", async () => {
      mockValidationResult.data.period = "invalid";

      mockAiService.getAiUsage.mockRejectedValue(new Error("Invalid period specified"));

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Invalid period specified");
    });

    it("should handle database errors", async () => {
      mockAiService.getAiUsage.mockRejectedValue(new Error("Database connection failed"));

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Internal server error");
    });

    it("should handle JWT errors", async () => {
      mockAiService.getAiUsage.mockRejectedValue(new Error("JWT token expired"));

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Invalid authentication token");
    });

    it("should handle permission errors", async () => {
      mockAiService.getAiUsage.mockRejectedValue(new Error("permission denied"));

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toBe("Access denied");
    });
  });

  describe("Query Parameter Parsing", () => {
    it("should parse period parameter correctly", async () => {
      mockContext.request = new Request("http://localhost:4321/api/ai/usage?period=year");
      mockValidationResult.data.period = "year";

      mockAiService.getAiUsage.mockResolvedValue({
        period: "year",
        start_date: "2023-01-01T00:00:00Z",
        end_date: "2024-01-01T00:00:00Z",
        total_generations: 50,
        total_input_tokens: 10000,
        total_output_tokens: 20000,
        total_cost: 1.5,
        models_used: { "gpt-4": { generations: 50, cost: 1.5 } },
        daily_breakdown: [],
      });

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.period).toBe("year");
      expect(body.total_generations).toBe(50);
    });

    it("should handle missing period parameter (defaults to month)", async () => {
      mockContext.request = new Request("http://localhost:4321/api/ai/usage");
      mockValidationResult.data.period = "month";

      mockAiService.getAiUsage.mockResolvedValue({
        period: "month",
        start_date: "2024-01-01T00:00:00Z",
        end_date: "2024-02-01T00:00:00Z",
        total_generations: 15,
        total_input_tokens: 3000,
        total_output_tokens: 6000,
        total_cost: 0.45,
        models_used: { "gpt-4": { generations: 15, cost: 0.45 } },
        daily_breakdown: [],
      });

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.period).toBe("month");
      expect(body.total_generations).toBe(15);
    });
  });
});
