import { z } from "zod";

/**
 * Zod schemas for AI usage analytics API validation.
 * 
 * These schemas ensure that all incoming query parameters are properly validated
 * before processing, providing type safety and consistent error messages.
 */

/**
 * Schema for AI usage query parameters.
 * @see GET /api/ai/usage
 */
export const aiUsageQuerySchema = z.object({
  period: z.enum(["day", "week", "month", "year", "custom"], {
    invalid_type_error: "Period must be one of: day, week, month, year, custom"
  }).optional().default("month"),
  start_date: z.string()
    .datetime("Start date must be a valid ISO date string")
    .optional()
    .refine(
      (val) => !val || !isNaN(new Date(val).getTime()),
      "Start date must be a valid date"
    ),
  end_date: z.string()
    .datetime("End date must be a valid ISO date string")
    .optional()
    .refine(
      (val) => !val || !isNaN(new Date(val).getTime()),
      "End date must be a valid date"
    )
}).refine(
  (data) => {
    // If period is custom, both start_date and end_date are required
    if (data.period === "custom") {
      return data.start_date && data.end_date;
    }
    return true;
  },
  {
    message: "Custom period requires both start_date and end_date",
    path: ["start_date"] // Show error on start_date field
  }
).refine(
  (data) => {
    // If both dates are provided, start_date must be before end_date
    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      return start < end;
    }
    return true;
  },
  {
    message: "Start date must be before end date",
    path: ["start_date"]
  }
);

/**
 * Type exports for use in API endpoints.
 */
export type AiUsageQueryInput = z.infer<typeof aiUsageQuerySchema>;
