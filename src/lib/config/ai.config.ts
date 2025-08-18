/**
 * Configuration for AI service.
 *
 * This file contains all the configuration options for AI recipe generation,
 * including model settings, rate limits, and cost calculations.
 */

export const AI_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour in milliseconds
    MAX_GENERATIONS_PER_HOUR: 10,
  },

  // Supported AI models
  MODELS: {
    "gpt-4": {
      name: "GPT-4",
      maxTokens: 8192,
      costPer1KInput: 0.03,
      costPer1KOutput: 0.06,
      description: "Most capable model, best for complex recipes",
    },
    "gpt-4o": {
      name: "GPT-4 Omni",
      maxTokens: 128000,
      costPer1KInput: 0.005,
      costPer1KOutput: 0.015,
      description: "Latest GPT-4 model, excellent for all recipe types",
    },
    "gpt-4o-mini": {
      name: "GPT-4 Omni Mini",
      maxTokens: 128000,
      costPer1KInput: 0.00015,
      costPer1KOutput: 0.0006,
      description: "Cost-effective GPT-4 model, great for most recipes",
    },
    "gpt-3.5-turbo": {
      name: "GPT-3.5 Turbo",
      maxTokens: 4096,
      costPer1KInput: 0.0015,
      costPer1KOutput: 0.002,
      description: "Fast and cost-effective, good for simple recipes",
    },
  },

  // Default model
  DEFAULT_MODEL: "gpt-4o-mini" as const,

  // Prompt templates
  PROMPTS: {
    RECIPE_GENERATION: `Generate a detailed recipe based on the following request:

User Request: {query}

User Preferences: {preferences}

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
- Make the recipe healthy and balanced
- Keep instructions concise but clear
- Include cooking times and temperatures where relevant`,

    RECIPE_REGENERATION: `Regenerate the recipe based on the original request and user preferences:

Original Request: {query}

User Preferences: {preferences}

Previous Recipe: {previousRecipe}

IMPORTANT: Always generate the recipe in Polish language.

Please provide a new variation of the recipe in the following JSON format:
{
  "title": "Nazwa Przepisu (Wariacja)",
  "ingredients": ["składnik 1 z ilością", "składnik 2 z ilością", ...],
  "shopping_list": ["produkt 1 z ilością", "produkt 2 z ilością", ...],
  "instructions": ["krok 1", "krok 2", ...]
}

Requirements:
- Generate the recipe entirely in Polish language
- Create a different variation while maintaining the same concept
- Consider user preferences and dietary restrictions
- Provide clear, step-by-step instructions
- Include a shopping list with quantities
- Ensure ingredients are commonly available
- Make the recipe healthy and balanced
- Keep instructions concise but clear
- Include cooking times and temperatures where relevant`,
  },

  // Error messages
  ERRORS: {
    RATE_LIMIT_EXCEEDED: "Rate limit exceeded: too many generations in the last hour",
    GENERATION_FAILED: "Recipe generation failed",
    INVALID_MODEL: "Invalid AI model specified",
    TOKEN_LIMIT_EXCEEDED: "Request too long for selected model",
  },
} as const;

export type AiModel = keyof typeof AI_CONFIG.MODELS;
export type AiConfig = typeof AI_CONFIG;
