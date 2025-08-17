import { describe, it, expect, beforeEach, vi } from "vitest";
import { AiService } from "../../lib/services/ai.service";
import type { SupabaseClient } from "../../db/supabase.client";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClient;

describe("AiService", () => {
  let aiService: AiService;

  beforeEach(() => {
    aiService = new AiService(mockSupabase);
    vi.clearAllMocks();
  });

  describe("generateRecipe", () => {
    it("should generate a recipe successfully", async () => {
      const mockAiGeneration = {
        user_id: "user-123",
        model: "gpt-4",
        prompt: expect.any(String),
        response: expect.any(String),
        input_tokens: expect.any(Number),
        output_tokens: expect.any(Number),
        cost: expect.any(Number)
      };

      // Mock rate limit check (no previous generations)
      const mockCountSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ count: 0, error: null })
        })
      });

      // Mock AI generation log insert
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockAiGeneration, error: null })
        })
      });

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce({
          select: mockCountSelect
        } as any)
        .mockReturnValueOnce({
          insert: mockInsert
        } as any);

      const result = await aiService.generateRecipe(
        "Make a healthy pasta dish",
        ["vegetarian", "low-carb"],
        "user-123",
        "gpt-4"
      );

      expect(result.title).toContain("AI Generated Recipe");
      expect(result.ingredients).toHaveLength(5);
      expect(result.instructions).toHaveLength(5);
      expect(result.aiGeneration.model).toBe("gpt-4");
      expect(mockSupabase.from).toHaveBeenCalledTimes(2);
    });

    it("should throw error when rate limit exceeded", async () => {
      // Mock rate limit exceeded
      const mockCountSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ count: 10, error: null })
        })
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockCountSelect
      } as any);

      await expect(aiService.generateRecipe(
        "Make a healthy pasta dish",
        ["vegetarian"],
        "user-123"
      )).rejects.toThrow("Rate limit exceeded: too many generations in the last hour");
    });

    it("should handle rate limit check errors gracefully", async () => {
      // Mock rate limit check error
      const mockCountSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ count: null, error: "Database error" })
        })
      });

      // Mock AI generation log insert
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: { model: "gpt-4", cost: 0.05 }, 
            error: null 
          })
        })
      });

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce({
          select: mockCountSelect
        } as any)
        .mockReturnValueOnce({
          insert: mockInsert
        } as any);

      // Should not throw error, should continue with generation
      const result = await aiService.generateRecipe(
        "Make a healthy pasta dish",
        ["vegetarian"],
        "user-123"
      );

      expect(result.title).toContain("AI Generated Recipe");
    });
  });

  describe("prompt building", () => {
    it("should build prompt with user preferences", async () => {
      // Access private method through reflection for testing
      const buildPrompt = (aiService as any).buildRecipePrompt;
      
      const prompt = buildPrompt(
        "Make a healthy pasta dish",
        ["vegetarian", "low-carb"]
      );

      expect(prompt).toContain("Make a healthy pasta dish");
      expect(prompt).toContain("User Preferences:");
      expect(prompt).toContain("- vegetarian");
      expect(prompt).toContain("- low-carb");
      expect(prompt).toContain("JSON format");
    });

    it("should build prompt without preferences", async () => {
      const buildPrompt = (aiService as any).buildRecipePrompt;
      
      const prompt = buildPrompt("Make a healthy pasta dish", []);

      expect(prompt).toContain("Make a healthy pasta dish");
      expect(prompt).not.toContain("User Preferences:");
    });
  });

  describe("cost calculation", () => {
    it("should calculate cost for GPT-4", async () => {
      const calculateCost = (aiService as any).calculateCost;
      
      const cost = calculateCost("gpt-4", 1000, 500);
      
      // GPT-4: $0.03 per 1K input tokens, $0.06 per 1K output tokens
      // Input: 1000 tokens = $0.03, Output: 500 tokens = $0.03
      // Total: $0.06
      expect(cost).toBe(0.06);
    });

    it("should calculate cost for GPT-3.5-turbo", async () => {
      const calculateCost = (aiService as any).calculateCost;
      
      const cost = calculateCost("gpt-3.5-turbo", 1000, 500);
      
      // GPT-3.5-turbo: $0.0015 per 1K input tokens, $0.002 per 1K output tokens
      // Input: 1000 tokens = $0.0015, Output: 500 tokens = $0.001
      // Total: $0.0025
      expect(cost).toBeCloseTo(0.0025, 4);
    });

    it("should return null for unknown model", async () => {
      const calculateCost = (aiService as any).calculateCost;
      
      const cost = calculateCost("unknown-model", 1000, 500);
      
      expect(cost).toBeNull();
    });
  });

  describe("getAiUsage", () => {
    it("should get AI usage for month period", async () => {
      const mockGenerations = [
        {
          model: "gpt-4",
          input_tokens: 100,
          output_tokens: 200,
          cost: 0.05,
          created_at: "2024-01-15T10:00:00Z"
        },
        {
          model: "gpt-3.5-turbo",
          input_tokens: 80,
          output_tokens: 150,
          cost: 0.02,
          created_at: "2024-01-16T11:00:00Z"
        }
      ];

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockGenerations,
                  error: null
                })
              })
            })
          })
        })
      } as any);

      const result = await aiService.getAiUsage("user123", "month");

      expect(result.period).toBe("month");
      expect(result.total_generations).toBe(2);
      expect(result.total_input_tokens).toBe(180);
      expect(result.total_output_tokens).toBe(350);
      expect(result.total_cost).toBe(0.07);
      expect(result.models_used).toEqual({
        "gpt-4": { generations: 1, cost: 0.05 },
        "gpt-3.5-turbo": { generations: 1, cost: 0.02 }
      });
      expect(result.daily_breakdown).toHaveLength(2);
      expect(result.daily_breakdown[0].date).toBe("2024-01-15");
      expect(result.daily_breakdown[1].date).toBe("2024-01-16");
    });

    it("should get AI usage for custom period", async () => {
      const mockGenerations = [
        {
          model: "gpt-4",
          input_tokens: 50,
          output_tokens: 100,
          cost: 0.025,
          created_at: "2024-01-10T10:00:00Z"
        }
      ];

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockGenerations,
                  error: null
                })
              })
            })
          })
        })
      } as any);

      const result = await aiService.getAiUsage(
        "user123",
        "custom",
        "2024-01-01T00:00:00Z",
        "2024-01-31T23:59:59Z"
      );

      expect(result.period).toBe("custom");
      expect(result.total_generations).toBe(1);
      expect(result.total_cost).toBeCloseTo(0.03, 2);
    });

    it("should handle empty results", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [],
                  error: null
                })
              })
            })
          })
        })
      } as any);

      const result = await aiService.getAiUsage("user123", "week");

      expect(result.total_generations).toBe(0);
      expect(result.total_input_tokens).toBe(0);
      expect(result.total_output_tokens).toBe(0);
      expect(result.total_cost).toBe(0);
      expect(result.models_used).toEqual({});
      expect(result.daily_breakdown).toEqual([]);
    });

    it("should handle null values in generation data", async () => {
      const mockGenerations = [
        {
          model: null,
          input_tokens: null,
          output_tokens: null,
          cost: null,
          created_at: "2024-01-15T10:00:00Z"
        }
      ];

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockGenerations,
                  error: null
                })
              })
            })
          })
        })
      } as any);

      const result = await aiService.getAiUsage("user123", "day");

      expect(result.total_generations).toBe(1);
      expect(result.total_input_tokens).toBe(0);
      expect(result.total_output_tokens).toBe(0);
      expect(result.total_cost).toBe(0);
      expect(result.models_used["unknown"]).toEqual({ generations: 1, cost: 0 });
    });

    it("should throw error for custom period without dates", async () => {
      await expect(
        aiService.getAiUsage("user123", "custom")
      ).rejects.toThrow("Custom period requires both start_date and end_date");
    });

    it("should throw error for invalid date range", async () => {
      await expect(
        aiService.getAiUsage(
          "user123",
          "custom",
          "2024-01-31T00:00:00Z",
          "2024-01-01T00:00:00Z"
        )
      ).rejects.toThrow("Start date must be before end date");
    });

    it("should throw error for invalid period", async () => {
      // Test with invalid period type
      await expect(
        aiService.getAiUsage("user123", "invalid" as any)
      ).rejects.toThrow("Invalid period specified");
    });
  });

  describe("calculateDateRange", () => {
    it("should calculate day period correctly", async () => {
      const mockGenerations: any[] = [];
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockGenerations,
                  error: null
                })
              })
            })
          })
        })
      } as any);

      const result = await aiService.getAiUsage("user123", "day");
      const startDate = new Date(result.start_date);
      const endDate = new Date(result.end_date);
      const now = new Date();

      // Day period should be approximately 24 hours ago
      expect(endDate.getTime()).toBeCloseTo(now.getTime(), -2); // Within 100ms
      expect(startDate.getTime()).toBeCloseTo(now.getTime() - 24 * 60 * 60 * 1000, -2);
    });

    it("should calculate week period correctly", async () => {
      const mockGenerations: any[] = [];
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockGenerations,
                  error: null
                })
              })
            })
          })
        })
      } as any);

      const result = await aiService.getAiUsage("user123", "week");
      const startDate = new Date(result.start_date);
      const endDate = new Date(result.end_date);
      const now = new Date();

      // Week period should be approximately 7 days ago
      expect(endDate.getTime()).toBeCloseTo(now.getTime(), -2);
      expect(startDate.getTime()).toBeCloseTo(now.getTime() - 7 * 24 * 60 * 60 * 1000, -2);
    });

    it("should calculate month period correctly", async () => {
      const mockGenerations: any[] = [];
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockGenerations,
                  error: null
                })
              })
            })
          })
        })
      } as any);

      const result = await aiService.getAiUsage("user123", "month");
      const startDate = new Date(result.start_date);
      const endDate = new Date(result.end_date);
      const now = new Date();

      // Month period should be approximately 1 month ago
      expect(endDate.getTime()).toBeCloseTo(now.getTime(), -2);
      const expectedMonthAgo = new Date(now);
      expectedMonthAgo.setMonth(expectedMonthAgo.getMonth() - 1);
      expect(startDate.getTime()).toBeCloseTo(expectedMonthAgo.getTime(), -2);
    });

    it("should calculate year period correctly", async () => {
      const mockGenerations: any[] = [];
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockGenerations,
                  error: null
                })
              })
            })
          })
        })
      } as any);

      const result = await aiService.getAiUsage("user123", "year");
      const startDate = new Date(result.start_date);
      const endDate = new Date(result.end_date);
      const now = new Date();

      // Year period should be approximately 1 year ago
      expect(endDate.getTime()).toBeCloseTo(now.getTime(), -2);
      const expectedYearAgo = new Date(now);
      expectedYearAgo.setFullYear(expectedYearAgo.getFullYear() - 1);
      expect(startDate.getTime()).toBeCloseTo(expectedYearAgo.getTime(), -2);
    });
  });
});
