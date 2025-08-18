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
    // Initialize with default API key, will be overridden per request if user has their own
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

    // Get user's API key if available
    let userApiKey: string | null = null;
    try {
      const { data: apiKeyData } = await this.supabase
        .from("user_api_keys")
        .select("api_key, is_active")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();
      
      if (apiKeyData?.api_key) {
        userApiKey = apiKeyData.api_key;
      }
    } catch (error) {
      // User doesn't have an API key, use default
      console.log(`User ${userId} doesn't have an API key, using default`);
    }

    // Build the prompt
    const prompt = this.buildRecipePrompt(query, userPreferences);

    try {
      // Create OpenAI client with user's API key if available, otherwise use default
      const openaiClient = userApiKey 
        ? new OpenAI({ apiKey: userApiKey })
        : this.openai;

      // Call OpenAI API
      const completion = await openaiClient.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content:
              "You are a professional chef and nutritionist. Generate healthy, practical recipes based on user requests. IMPORTANT: Always generate recipes in Polish language. Always respond with valid JSON only, no additional text. CRITICAL: If the user has allergies, NEVER include those ingredients - this is a matter of health and safety. Double-check all ingredients against the allergy list before finalizing the recipe. Remember: Food allergies can be life-threatening, so be extremely careful and thorough in your ingredient selection.",
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
    if (!userPreferences || userPreferences.length === 0) {
      return `Generate a detailed recipe based on the following request:

User Request: ${query}

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
- Provide clear, step-by-step instructions
- Include a shopping list with quantities
- Ensure ingredients are commonly available
- Make the recipe healthy and balanced`;
    }

    // Categorize preferences to better handle allergies
    const { allergies, dietPreferences, cuisinePreferences } = this.categorizePreferences(userPreferences);

    let preferencesText = "";
    
    if (dietPreferences.length > 0) {
      preferencesText += `\n\nDietary Preferences:\n${dietPreferences.map((p) => `- ${p}`).join("\n")}`;
    }
    
    if (cuisinePreferences.length > 0) {
      preferencesText += `\n\nCuisine Preferences:\n${cuisinePreferences.map((p) => `- ${p}`).join("\n")}`;
    }

    // Special handling for allergies - make them very clear to AI
    if (allergies.length > 0) {
      preferencesText += `\n\n⚠️ CRITICAL - ALLERGIES TO AVOID (NEVER include these ingredients):\n${allergies.map((allergy) => `- ${allergy} (ABSOLUTELY FORBIDDEN)`).join("\n")}`;
    }

    return `Generate a detailed recipe based on the following request:

User Request: ${query}${preferencesText}

IMPORTANT: Always generate the recipe in Polish language.

${allergies.length > 0 ? `⚠️ CRITICAL ALLERGY WARNING: The user has severe allergies to the ingredients listed above. 
NEVER include any of these ingredients in the recipe, shopping list, or instructions. 
This is a matter of health and safety - double-check every ingredient carefully.
Remember: Including these ingredients could cause serious health problems or allergic reactions.

IMPORTANT: Before including any ingredient, check if it contains or is related to any of these allergens:
${allergies.map(allergy => `- ${allergy}: Check for any variations, derivatives, or related ingredients`).join('\n')}

Examples of what to avoid:
- If allergy is "orzechy" (nuts): avoid all nuts, nut butters, nut oils, nut flours, nut extracts
- If allergy is "gluten": avoid wheat, rye, barley, and any products containing these grains
- If allergy is "laktoza" (lactose): avoid milk, cheese, yogurt, butter, and dairy products

SAFETY CHECKLIST - Before finalizing, verify:
1. No forbidden allergens in ingredients list
2. No forbidden allergens in shopping list  
3. No forbidden allergens in cooking instructions
4. No derivatives or variations of forbidden allergens
5. All ingredients are safe alternatives` : ''}

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
- Consider user dietary preferences and cuisine choices
- ${allergies.length > 0 ? 'CRITICAL: NEVER include any ingredients from the allergies list above - these are absolutely forbidden for health reasons' : 'Provide clear, step-by-step instructions'}
- Provide clear, step-by-step instructions
- Include a shopping list with quantities
- Ensure ingredients are commonly available
- Make the recipe healthy and balanced
- ${allergies.length > 0 ? 'Double-check that NO forbidden ingredients are included in the recipe, shopping list, or instructions' : ''}
${allergies.length > 0 ? `- Before finalizing, verify that NONE of these ingredients appear anywhere: ${allergies.join(', ')}` : ''}
${allergies.length > 0 ? `- This is a critical safety requirement - failure to exclude these ingredients could harm the user's health` : ''}
${allergies.length > 0 ? `- Check every ingredient name, including any variations or derivatives of the forbidden allergens` : ''}
${allergies.length > 0 ? `- If unsure about any ingredient, choose a safer alternative that definitely doesn't contain allergens` : ''}
${allergies.length > 0 ? `- Use the safety checklist above to verify your recipe is completely allergen-free` : ''}
${allergies.length > 0 ? `- When in doubt, err on the side of caution and choose a different ingredient` : ''}`;
  }

  /**
   * Categorizes user preferences into different types for better AI prompt construction.
   * @param preferences - Array of user preference strings
   * @returns Categorized preferences object
   */
  private categorizePreferences(preferences: string[]): {
    allergies: string[];
    dietPreferences: string[];
    cuisinePreferences: string[];
  } {
    const allergies: string[] = [];
    const dietPreferences: string[] = [];
    const cuisinePreferences: string[] = [];

    // Define keywords for each category with multiple variations
    const allergyKeywords = [
      // Polish allergy terms
      "gluten", "laktoza", "orzechy", "skorupiaki", "jaja", "soja", "ryby", "sezam",
      "orzech", "orzechowy", "orzechowe", "orzechowa", "orzechami", "orzechach",
      "orzeszki", "orzeszek", "orzeszkami", "orzeszkach", "orzeszkowy", "orzeszkowe", "orzeszkowa",
      "orzeszkiem", "orzeszku", "orzeszków", "orzeszkom", "orzeszkach",
      "orzeszki ziemne", "orzeszki arachidowe", "orzeszki włoskie", "orzeszki laskowe", "orzeszki brazylijskie",
      "orzeszki nerkowca", "orzeszki pistacjowe", "orzeszki migdałowe", "orzeszki pekan",
      "arachidowe", "włoskie", "laskowe", "brazylijskie", "nerkowca", "pistacjowe", "migdałowe", "pekan",
      "glutenowy", "glutenowe", "glutenowa", "glutenem", "glutenie",
      "laktozowy", "laktozowe", "laktozowa", "laktozą", "laktozie",
      "skorupiak", "skorupiakowy", "skorupiakowe", "skorupiakowa", "skorupiakami", "skorupiakach",
      "jajeczny", "jajeczne", "jajeczna", "jajkami", "jajkach",
      "sojowy", "sojowe", "sojowa", "soją", "soi",
      "rybny", "rybne", "rybna", "rybami", "rybach",
      "sezamowy", "sezamowe", "sezamowa", "sezamem", "sezamie",
      
      // English allergy terms
      "gluten", "lactose", "nuts", "shellfish", "eggs", "soy", "fish", "sesame",
      "nut", "nutty", "shell", "fishy", "egg", "soybean",
      "peanut", "walnut", "hazelnut", "brazil nut", "cashew", "pistachio", "almond", "pecan",
      "peanuts", "walnuts", "hazelnuts", "brazil nuts", "cashews", "pistachios", "almonds", "pecans",
      
      // Common variations and misspellings
      "orzeszki", "orzeszkami", "orzeszkach", "orzeszkowy", "orzeszkowe", "orzeszkowa",
      "orzeszkiem", "orzeszku", "orzeszków", "orzeszkom", "orzeszkach",
      "orzeszkach", "orzeszkami", "orzeszkowy", "orzeszkowe", "orzeszkowa",
      "orzeszkiem", "orzeszku", "orzeszków", "orzeszkom", "orzeszkach"
    ];
    
    const dietKeywords = [
      // Polish diet terms
      "wegetariańska", "wegańska", "keto", "paleo", "bezglutenowa", "low-carb", "high-protein", "mediterranean",
      "wegetariański", "wegetariańskie", "wegetariańskim", "wegetariańskimi", "wegetariańskich",
      "wegański", "wegańskie", "wegańskim", "wegańskimi", "wegańskich",
      "ketogeniczna", "ketogeniczny", "ketogeniczne", "ketogenicznym", "ketogenicznymi", "ketogenicznych",
      "paleolityczna", "paleolityczny", "paleolityczne", "paleolitycznym", "paleolitycznymi", "paleolitycznych",
      "bezglutenowy", "bezglutenowe", "bezglutenowym", "bezglutenowymi", "bezglutenowych",
      "niskowęglowodanowa", "niskowęglowodanowy", "niskowęglowodanowe", "niskowęglowodanowym", "niskowęglowodanowymi", "niskowęglowodanowych",
      "wysokobiałkowa", "wysokobiałkowy", "wysokobiałkowe", "wysokobiałkowym", "wysokobiałkowymi", "wysokobiałkowych",
      "śródziemnomorska", "śródziemnomorski", "śródziemnomorskie", "śródziemnomorskim", "śródziemnomorskimi", "śródziemnomorskich",
      
      // English diet terms
      "vegetarian", "vegan", "keto", "paleo", "gluten-free", "low-carb", "high-protein"
    ];
    
    const cuisineKeywords = [
      // Polish cuisine terms
      "polska", "włoska", "azjatycka", "meksykańska", "francuska", "indyjska", "tajska", "grecka", "japońska", "bliskowschodnia",
      "polski", "polskie", "polskim", "polskimi", "polskich",
      "włoski", "włoskie", "włoskim", "włoskimi", "włoskich",
      "azjatycki", "azjatyckie", "azjatyckim", "azjatyckimi", "azjatyckich",
      "meksykański", "meksykańskie", "meksykańskim", "meksykańskimi", "meksykańskich",
      "francuski", "francuskie", "francuskim", "francuskimi", "francuskich",
      "indyjski", "indyjskie", "indyjskim", "indyjskimi", "indyjskich",
      "tajski", "tajskie", "tajskim", "tajskimi", "tajskich",
      "grecki", "greckie", "greckim", "greckimi", "greckich",
      "japoński", "japońskie", "japońskim", "japońskimi", "japońskich",
      "bliskowschodni", "bliskowschodnie", "bliskowschodnim", "bliskowschodnimi", "bliskowschodnich",
      
      // English cuisine terms
      "polish", "italian", "asian", "mexican", "french", "indian", "thai", "greek", "japanese", "middle-eastern"
    ];

    preferences.forEach((preference) => {
      const lowerPref = preference.toLowerCase();
      
      if (allergyKeywords.some(keyword => lowerPref.includes(keyword))) {
        allergies.push(preference);
      } else if (dietKeywords.some(keyword => lowerPref.includes(keyword))) {
        dietPreferences.push(preference);
      } else if (cuisineKeywords.some(keyword => lowerPref.includes(keyword))) {
        cuisinePreferences.push(preference);
      } else {
        // Default to diet preferences if unsure
        dietPreferences.push(preference);
      }
    });

    return { allergies, dietPreferences, cuisinePreferences };
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
   * Retrieves AI usage statistics for a user over a specified period.
   * @param userId - User ID to get statistics for
   * @param period - Time period (day, week, month, year, custom)
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
      console.log("AiService.getAiUsage - Starting with params:", { userId, period, startDate, endDate });
      
      // Calculate start and end dates based on period
      const { start, end } = this.calculateDateRange(period, startDate, endDate);
      console.log("AiService.getAiUsage - Calculated date range:", { start: start.toISOString(), end: end.toISOString() });

      // Get AI generation data for the period
      console.log("AiService.getAiUsage - Querying database for user:", userId);
      const { data: generations, error } = await this.supabase
        .from("ai_usage")
        .select("model, input_tokens, output_tokens, cost, created_at")
        .eq("user_id", userId)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("AiService.getAiUsage - Database error:", error);
        throw error;
      }

      console.log("AiService.getAiUsage - Database result:", { 
        generationsCount: generations?.length || 0,
        firstGeneration: generations?.[0],
        lastGeneration: generations?.[generations?.length - 1]
      });

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

      const result = {
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

      console.log("AiService.getAiUsage - Final result:", {
        period: result.period,
        total_generations: result.total_generations,
        total_cost: result.total_cost,
        models_count: Object.keys(result.models_used).length,
        daily_breakdown_count: result.daily_breakdown.length
      });

      return result;
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
