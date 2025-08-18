import { describe, it, expect, vi, beforeEach } from "vitest";
import { AiService } from "../../lib/services/ai.service";
import type { SupabaseClient } from "../../db/supabase.client";

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

// Mock Supabase client
const mockSupabase = {
  from: vi.fn() as any,
  auth: {
    getUser: vi.fn(),
  },
} as unknown as SupabaseClient;

describe("AiService", () => {
  let aiService: AiService;

  beforeEach(() => {
    vi.resetAllMocks();
    aiService = new AiService(mockSupabase);
  });

  describe("generateRecipe", () => {
    it("should throw error when rate limit exceeded", async () => {
      // Mock rate limit exceeded
      const mockCountSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ count: 10, error: null }),
        }),
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockCountSelect,
      } as any);

      await expect(aiService.generateRecipe("Make a healthy pasta dish", ["vegetarian"], "user-123")).rejects.toThrow(
        "Rate limit exceeded: too many generations in the last hour"
      );
    });

    it("should throw error when rate limit exceeded", async () => {
      // Mock rate limit exceeded
      const mockCountSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ count: 10, error: null }),
        }),
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockCountSelect,
      } as any);

      await expect(aiService.generateRecipe("Make a healthy pasta dish", ["vegetarian"], "user-123")).rejects.toThrow(
        "Rate limit exceeded: too many generations in the last hour"
      );
    });


  });




});
