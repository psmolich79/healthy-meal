import { describe, it, expect, beforeEach, vi } from "vitest";
import { AiService } from "../../lib/services/ai.service";
import type { SupabaseClient } from "../../db/supabase.client";

// Mock OpenAI
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
  from: vi.fn(),
} as unknown as SupabaseClient;

describe("AiService", () => {
  let aiService: AiService;

  beforeEach(() => {
    aiService = new AiService(mockSupabase);
    vi.clearAllMocks();
  });

  describe("categorizePreferences", () => {
    it("should correctly categorize allergy preferences", () => {
      const preferences = ["orzechy", "gluten", "laktoza"];
      
      // Access private method for testing
      const result = (aiService as any).categorizePreferences(preferences);
      
      expect(result.allergies).toEqual(["orzechy", "gluten", "laktoza"]);
      expect(result.dietPreferences).toEqual([]);
      expect(result.cuisinePreferences).toEqual([]);
    });

    it("should correctly categorize diet preferences", () => {
      const preferences = ["wegetariańska", "wegańska", "keto"];
      
      const result = (aiService as any).categorizePreferences(preferences);
      
      expect(result.allergies).toEqual([]);
      expect(result.dietPreferences).toEqual(["wegetariańska", "wegańska", "keto"]);
      expect(result.cuisinePreferences).toEqual([]);
    });

    it("should correctly categorize cuisine preferences", () => {
      const preferences = ["polska", "włoska", "azjatycka"];
      
      const result = (aiService as any).categorizePreferences(preferences);
      
      expect(result.allergies).toEqual([]);
      expect(result.dietPreferences).toEqual([]);
      expect(result.cuisinePreferences).toEqual(["polska", "włoska", "azjatycka"]);
    });

    it("should correctly categorize mixed preferences", () => {
      const preferences = ["orzechy", "wegetariańska", "polska", "gluten"];
      
      const result = (aiService as any).categorizePreferences(preferences);
      
      expect(result.allergies).toEqual(["orzechy", "gluten"]);
      expect(result.dietPreferences).toEqual(["wegetariańska"]);
      expect(result.cuisinePreferences).toEqual(["polska"]);
    });

    it("should handle variations of allergy terms", () => {
      const preferences = ["orzeszki", "orzechowy", "glutenowe", "laktozowy"];
      
      const result = (aiService as any).categorizePreferences(preferences);
      
      expect(result.allergies).toEqual(["orzeszki", "orzechowy", "glutenowe", "laktozowy"]);
      expect(result.dietPreferences).toEqual([]);
      expect(result.cuisinePreferences).toEqual([]);
    });

    it("should handle empty preferences", () => {
      const preferences: string[] = [];
      
      const result = (aiService as any).categorizePreferences(preferences);
      
      expect(result.allergies).toEqual([]);
      expect(result.dietPreferences).toEqual([]);
      expect(result.cuisinePreferences).toEqual([]);
    });

    it("should handle unknown preferences as diet preferences", () => {
      const preferences = ["unknown-preference", "custom-diet"];
      
      const result = (aiService as any).categorizePreferences(preferences);
      
      expect(result.allergies).toEqual([]);
      expect(result.dietPreferences).toEqual(["unknown-preference", "custom-diet"]);
      expect(result.cuisinePreferences).toEqual([]);
    });
  });

  describe("buildRecipePrompt", () => {
    it("should build prompt without preferences", () => {
      const query = "zdrowa kolacja";
      const preferences: string[] = [];
      
      const result = (aiService as any).buildRecipePrompt(query, preferences);
      
      expect(result).toContain("User Request: zdrowa kolacja");
      expect(result).not.toContain("User Preferences:");
      expect(result).not.toContain("CRITICAL ALLERGY WARNING");
    });

    it("should build prompt with diet preferences only", () => {
      const query = "zdrowa kolacja";
      const preferences = ["wegetariańska", "keto"];
      
      const result = (aiService as any).buildRecipePrompt(query, preferences);
      
      expect(result).toContain("User Request: zdrowa kolacja");
      expect(result).toContain("Dietary Preferences:");
      expect(result).toContain("- wegetariańska");
      expect(result).toContain("- keto");
      expect(result).not.toContain("CRITICAL ALLERGY WARNING");
    });

    it("should build prompt with cuisine preferences only", () => {
      const query = "zdrowa kolacja";
      const preferences = ["polska", "włoska"];
      
      const result = (aiService as any).buildRecipePrompt(query, preferences);
      
      expect(result).toContain("User Request: zdrowa kolacja");
      expect(result).toContain("Cuisine Preferences:");
      expect(result).toContain("- polska");
      expect(result).toContain("- włoska");
      expect(result).not.toContain("CRITICAL ALLERGY WARNING");
    });

    it("should build prompt with allergies and show critical warning", () => {
      const query = "zdrowa kolacja";
      const preferences = ["orzechy", "gluten"];
      
      const result = (aiService as any).buildRecipePrompt(query, preferences);
      
      expect(result).toContain("User Request: zdrowa kolacja");
      expect(result).toContain("⚠️ CRITICAL - ALLERGIES TO AVOID");
      expect(result).toContain("- orzechy (ABSOLUTELY FORBIDDEN)");
      expect(result).toContain("- gluten (ABSOLUTELY FORBIDDEN)");
      expect(result).toContain("CRITICAL ALLERGY WARNING");
      expect(result).toContain("NEVER include any of these ingredients");
      expect(result).toContain("This is a matter of health and safety");
    });

    it("should build prompt with mixed preferences including allergies", () => {
      const query = "zdrowa kolacja";
      const preferences = ["orzechy", "wegetariańska", "polska"];
      
      const result = (aiService as any).buildRecipePrompt(query, preferences);
      
      expect(result).toContain("User Request: zdrowa kolacja");
      expect(result).toContain("⚠️ CRITICAL - ALLERGIES TO AVOID");
      expect(result).toContain("- orzechy (ABSOLUTELY FORBIDDEN)");
      expect(result).toContain("Dietary Preferences:");
      expect(result).toContain("- wegetariańska");
      expect(result).toContain("Cuisine Preferences:");
      expect(result).toContain("- polska");
      expect(result).toContain("CRITICAL ALLERGY WARNING");
    });

    it("should include safety checklist when allergies are present", () => {
      const query = "zdrowa kolacja";
      const preferences = ["orzechy"];
      
      const result = (aiService as any).buildRecipePrompt(query, preferences);
      
      expect(result).toContain("SAFETY CHECKLIST - Before finalizing, verify:");
      expect(result).toContain("1. No forbidden allergens in ingredients list");
      expect(result).toContain("2. No forbidden allergens in shopping list");
      expect(result).toContain("3. No forbidden allergens in cooking instructions");
      expect(result).toContain("4. No derivatives or variations of forbidden allergens");
      expect(result).toContain("5. All ingredients are safe alternatives");
    });

    it("should include examples of what to avoid for common allergies", () => {
      const query = "zdrowa kolacja";
      const preferences = ["orzechy", "gluten", "laktoza"];
      
      const result = (aiService as any).buildRecipePrompt(query, preferences);
      
      expect(result).toContain("Examples of what to avoid:");
      expect(result).toContain("If allergy is \"orzechy\" (nuts): avoid all nuts, nut butters, nut oils, nut flours, nut extracts");
      expect(result).toContain("If allergy is \"gluten\": avoid wheat, rye, barley, and any products containing these grains");
      expect(result).toContain("If allergy is \"laktoza\" (lactose): avoid milk, cheese, yogurt, butter, and dairy products");
    });

    it("should include critical safety requirements in requirements section", () => {
      const query = "zdrowa kolacja";
      const preferences = ["orzechy"];
      
      const result = (aiService as any).buildRecipePrompt(query, preferences);
      
      expect(result).toContain("CRITICAL: NEVER include any ingredients from the allergies list above");
      expect(result).toContain("This is a critical safety requirement - failure to exclude these ingredients could harm the user's health");
      expect(result).toContain("Check every ingredient name, including any variations or derivatives of the forbidden allergens");
      expect(result).toContain("If unsure about any ingredient, choose a safer alternative that definitely doesn't contain allergens");
      expect(result).toContain("Use the safety checklist above to verify your recipe is completely allergen-free");
      expect(result).toContain("When in doubt, err on the side of caution and choose a different ingredient");
    });
  });
});
