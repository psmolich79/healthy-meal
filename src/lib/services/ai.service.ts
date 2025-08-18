import OpenAI from "openai";
import type { SupabaseClient } from "../../db/supabase.client";
import type { Profile, AiUsage } from "../../types";

/**
 * Service for AI-powered recipe generation.
 *
 * This service handles communication with AI models, prompt engineering,
 * rate limiting, and cost tracking for recipe generation.
 *
 * @example
 * ```typescript
 * const aiService = new AiService(supabaseClient);
 * const recipe = await aiService.generateRecipe(query, userPreferences);
 * ```
 */
export class AiService {
  private readonly rateLimitWindow = 60 * 60 * 1000; // 1 hour in milliseconds
  private readonly maxGenerationsPerHour = 10; // Maximum generations per hour per user
  private readonly openai: OpenAI;

  constructor(private readonly supabase: SupabaseClient) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generates a recipe using AI based on user query and preferences.
   * @param query - User's recipe request
   * @param userPreferences - User's dietary preferences
   * @param userId - User ID for rate limiting
   * @param model - AI model to use (optional)
   * @returns Generated recipe data
   */
  async generateRecipe(
    query: string,
    userPreferences: Profile["preferences"],
    userId: string,
    model = "gpt-4o-mini"
  ): Promise<{
    title: string;
    ingredients: string[];
    shopping_list: string[];
    instructions: string[];
    aiGeneration: Omit<AiUsage, "id" | "recipe_id" | "created_at">;
  }> {
    // Check rate limiting
    await this.checkRateLimit(userId);

    // Build the prompt
    const prompt = this.buildRecipePrompt(query, userPreferences);

    try {
      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content:
              "You are a professional chef and nutritionist. Generate healthy, practical recipes based on user requests. IMPORTANT: Always generate recipes in Polish language. Always respond with valid JSON only, no additional text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }

      // Parse the JSON response (handle markdown formatting)
      let parsedResponse;
      try {
        // Remove markdown code blocks if present
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith("```json")) {
          cleanResponse = cleanResponse.substring(7); // Remove ```json
        }
        if (cleanResponse.startsWith("```")) {
          cleanResponse = cleanResponse.substring(3); // Remove ```
        }
        if (cleanResponse.endsWith("```")) {
          cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3); // Remove trailing ```
        }

        cleanResponse = cleanResponse.trim();
        parsedResponse = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error("Failed to parse OpenAI response:", response);
        console.error("Parse error:", parseError);
        throw new Error("Invalid JSON response from AI");
      }

      const generatedRecipe = {
        title: parsedResponse.title || "Generated Recipe",
        ingredients: parsedResponse.ingredients || [],
        shopping_list: parsedResponse.shopping_list || [],
        instructions: parsedResponse.instructions || [],
      };

      // Calculate actual token usage
      const inputTokens = completion.usage?.prompt_tokens || 0;
      const outputTokens = completion.usage?.completion_tokens || 0;

      // Log the generation (exclude prompt as it's not in ai_usage table)
      const aiGeneration = await this.logGeneration({
        user_id: userId,
        model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost: this.calculateCost(model, inputTokens, outputTokens) || 0,
      });

      return {
        ...generatedRecipe,
        aiGeneration,
      };
    } catch (error) {
      console.error("Error generating recipe with AI:", error);
      throw new Error("Recipe generation failed");
    }
  }

  /**
   * Checks if user has exceeded rate limits for AI generation.
   * @param userId - User ID to check
   * @throws Error if rate limit exceeded
   */
  private async checkRateLimit(userId: string): Promise<void> {
    try {
      const oneHourAgo = new Date(Date.now() - this.rateLimitWindow);

      const { count, error } = await this.supabase
        .from("ai_usage")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", oneHourAgo.toISOString());

      if (error) {
        throw error;
      }

      if (count && count >= this.maxGenerationsPerHour) {
        throw new Error("Rate limit exceeded: too many generations in the last hour");
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("Rate limit exceeded")) {
        throw error;
      }
      console.error("Error checking rate limit:", error);
      // Don't block generation if rate limit check fails
    }
  }

  /**
   * Builds a comprehensive prompt for AI recipe generation.
   * @param query - User's recipe request
   * @param userPreferences - User's dietary preferences
   * @returns Formatted prompt string
   */
  private buildRecipePrompt(query: string, userPreferences: Profile["preferences"]): string {
    const preferencesText =
      userPreferences && userPreferences.length > 0
        ? `\n\nUser Preferences:\n${userPreferences.map((p) => `- ${p}`).join("\n")}`
        : "";

    return `Generate a detailed recipe based on the following request:

User Request: ${query}${preferencesText}

IMPORTANT: Always generate the recipe in Polish language.

Please provide the recipe in the following JSON format:
{
  "title": "Nazwa Przepisu",
  "ingredients": ["składnik 1 z ilością", "składnik 2 z ilością", ...],
  "shopping_list": ["produkt 1 z ilością", "produkt 2 z ilością", ...],
  "instructions": ["krok 1", "krok 2", ...]
}

Requirements:
- Generate the recipe entirely in Polish language
- Make the recipe practical and easy to follow
- Consider user preferences and dietary restrictions
- Provide clear, step-by-step instructions
- Include a shopping list with quantities
- Ensure ingredients are commonly available
- Make the recipe healthy and balanced`;
  }

  /**
   * Generates a placeholder recipe for development/testing.
   * @param query - User's recipe request
   * @param userPreferences - User's dietary preferences
   * @returns Placeholder recipe data
   */
  private async generatePlaceholderRecipe(
    query: string,
    userPreferences: Profile["preferences"]
  ): Promise<{
    title: string;
    ingredients: string[];
    shopping_list: string[];
    instructions: string[];
  }> {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const preferencesText = userPreferences && userPreferences.length > 0 ? ` (${userPreferences.join(", ")})` : "";

    return {
      title: `AI Generated Recipe: ${query.substring(0, 30)}...${preferencesText}`,
      ingredients: [
        "2 cups all-purpose flour",
        "1 cup warm water",
        "2 tablespoons olive oil",
        "1 teaspoon salt",
        "1 teaspoon active dry yeast",
      ],
      shopping_list: [
        "All-purpose flour (2 cups)",
        "Active dry yeast (1 packet)",
        "Olive oil (small bottle)",
        "Salt (if not available)",
      ],
      instructions: [
        "Mix warm water with yeast and let stand for 5 minutes",
        "Combine flour and salt in a large bowl",
        "Add yeast mixture and olive oil to flour",
        "Knead dough for 10 minutes until smooth",
        "Let rise for 1 hour, then shape and bake",
      ],
    };
  }

  /**
   * Logs an AI generation event in the database.
   * @param generationData - Generation data to log
   * @returns Logged generation record
   */
  private async logGeneration(
    generationData: Omit<AiUsage, "id" | "recipe_id" | "created_at">
  ): Promise<Omit<AiUsage, "id" | "recipe_id" | "created_at">> {
    try {
      const { data, error } = await this.supabase
        .from("ai_usage")
        .insert({
          ...generationData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error logging AI generation:", error);
        // Don't fail the request if logging fails
        return generationData;
      }

      return data;
    } catch (error) {
      console.error("Error logging AI generation:", error);
      return generationData;
    }
  }

  /**
   * Calculates the cost of an AI generation based on token usage.
   * @param model - AI model used
   * @param inputTokens - Number of input tokens
   * @param outputTokens - Number of output tokens
   * @returns Cost in USD or null if calculation fails
   */
  private calculateCost(model: string, inputTokens: number, outputTokens: number): number | null {
    try {
      // OpenAI costs per 1000 tokens (as of 2024)
      const costs = {
        "gpt-4": { input: 0.03, output: 0.06 },
        "gpt-4o": { input: 0.005, output: 0.015 },
        "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
        "gpt-3.5-turbo": { input: 0.0015, output: 0.002 },
      };

      const modelCosts = costs[model as keyof typeof costs];
      if (!modelCosts) {
        return null;
      }

      const inputCost = (inputTokens / 1000) * modelCosts.input;
      const outputCost = (outputTokens / 1000) * modelCosts.output;

      return Math.round((inputCost + outputCost) * 10000) / 10000; // Round to 4 decimal places
    } catch (error) {
      console.error("Error calculating cost:", error);
      return null;
    }
  }

  /**
   * Gets comprehensive AI usage statistics for a user.
   * @param userId - User ID
   * @param period - Time period for statistics
   * @param startDate - Custom start date (for custom period)
   * @param endDate - Custom end date (for custom period)
   * @returns Complete AI usage statistics
   */
  async getAiUsage(
    userId: string,
    period: "day" | "week" | "month" | "year" | "custom" = "month",
    startDate?: string,
    endDate?: string
  ): Promise<{
    period: "day" | "week" | "month" | "year" | "custom";
    start_date: string;
    end_date: string;
    total_generations: number;
    total_input_tokens: number;
    total_output_tokens: number;
    total_cost: number | null;
    models_used: Record<string, { generations: number; cost: number | null }>;
    daily_breakdown: { date: string; generations: number; cost: number | null }[];
  }> {
    try {
      // Calculate start and end dates based on period
      const { start, end } = this.calculateDateRange(period, startDate, endDate);

      // Get AI generation data for the period
      const { data: generations, error } = await this.supabase
        .from("ai_usage")
        .select("model, input_tokens, output_tokens, cost, created_at")
        .eq("user_id", userId)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      // Calculate totals
      let totalGenerations = 0;
      let totalInputTokens = 0;
      let totalOutputTokens = 0;
      let totalCost = 0;

      // Aggregate by model
      const modelBreakdown: Record<string, { generations: number; cost: number | null }> = {};

      // Daily breakdown
      const dailyBreakdownMap = new Map<string, { generations: number; cost: number | null }>();

      generations?.forEach((generation) => {
        totalGenerations++;
        totalInputTokens += generation.input_tokens || 0;
        totalOutputTokens += generation.output_tokens || 0;
        totalCost += generation.cost || 0;

        // Model breakdown
        const model = generation.model || "unknown";
        if (!modelBreakdown[model]) {
          modelBreakdown[model] = { generations: 0, cost: 0 };
        }
        modelBreakdown[model].generations++;
        modelBreakdown[model].cost += generation.cost || 0;

        // Daily breakdown
        const date = generation.created_at.split("T")[0]; // Extract YYYY-MM-DD
        if (!dailyBreakdownMap.has(date)) {
          dailyBreakdownMap.set(date, { generations: 0, cost: 0 });
        }
        const daily = dailyBreakdownMap.get(date)!;
        daily.generations++;
        daily.cost += generation.cost || 0;
      });

      // Convert daily breakdown map to sorted array
      const dailyBreakdown = Array.from(dailyBreakdownMap.entries())
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        period,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        total_generations: totalGenerations,
        total_input_tokens: totalInputTokens,
        total_output_tokens: totalOutputTokens,
        total_cost: totalCost > 0 ? Math.round(totalCost * 100) / 100 : 0,
        models_used: modelBreakdown,
        daily_breakdown: dailyBreakdown,
      };
    } catch (error) {
      console.error("Error getting AI usage:", error);
      throw error;
    }
  }

  /**
   * Calculates start and end dates based on period and optional custom dates.
   * @param period - Time period
   * @param startDate - Custom start date (optional)
   * @param endDate - Custom end date (optional)
   * @returns Object with start and end dates
   */
  private calculateDateRange(
    period: "day" | "week" | "month" | "year" | "custom",
    startDate?: string,
    endDate?: string
  ): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (period) {
      case "day":
        start = new Date(now);
        start.setDate(start.getDate() - 1);
        break;
      case "week":
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        break;
      case "month":
        start = new Date(now);
        start.setMonth(start.getMonth() - 1);
        break;
      case "year":
        start = new Date(now);
        start.setFullYear(start.getFullYear() - 1);
        break;
      case "custom":
        if (!startDate || !endDate) {
          throw new Error("Custom period requires both start_date and end_date");
        }
        start = new Date(startDate);
        end = new Date(endDate);

        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error("Invalid date format");
        }
        if (start > end) {
          throw new Error("Start date must be before end date");
        }
        break;
      default:
        throw new Error("Invalid period specified");
    }

    return { start, end };
  }
}
