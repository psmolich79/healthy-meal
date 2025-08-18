import type { SupabaseClient } from "../../db/supabase.client";
import type { ApiUsageLog, ApiUsageLimits } from "@/types";

export class ApiUsageService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Check if user can make API request based on daily limits
   */
  async checkDailyLimit(userId: string): Promise<{ canProceed: boolean; limits: ApiUsageLimits }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's usage count
      const { data: usageLogs, error } = await this.supabase
        .from("api_usage_logs")
        .select("id")
        .eq("user_id", userId)
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString());

      if (error) {
        console.error("Error checking daily limit:", error);
        // If we can't check, allow the request (fail open)
        return {
          canProceed: true,
          limits: {
            daily_limit: 1,
            current_usage: 0,
            remaining_usage: 1,
            reset_time: tomorrow.toISOString(),
          },
        };
      }

      const currentUsage = usageLogs?.length || 0;
      const dailyLimit = 1; // 1 recipe per day for env key
      const canProceed = currentUsage < dailyLimit;

      return {
        canProceed,
        limits: {
          daily_limit: dailyLimit,
          current_usage: currentUsage,
          remaining_usage: Math.max(0, dailyLimit - currentUsage),
          reset_time: tomorrow.toISOString(),
        },
      };
    } catch (error) {
      console.error("Error in checkDailyLimit:", error);
      // Fail open - allow request if we can't check limits
      return {
        canProceed: true,
        limits: {
          daily_limit: 1,
          current_usage: 0,
          remaining_usage: 1,
          reset_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      };
    }
  }

  /**
   * Check if user with profile API key can make unlimited requests
   */
  async checkProfileApiKeyLimit(userId: string): Promise<{ canProceed: boolean; limits: ApiUsageLimits }> {
    try {
      // Check if user has an active API key in their profile
      const { data: apiKey, error } = await this.supabase
        .from("user_api_keys")
        .select("id, is_active")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking profile API key:", error);
        return this.checkDailyLimit(userId); // Fallback to daily limit
      }

      if (apiKey && apiKey.is_active) {
        // User has active profile API key - unlimited usage
        return {
          canProceed: true,
          limits: {
            daily_limit: -1, // -1 means unlimited
            current_usage: 0,
            remaining_usage: -1,
            reset_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        };
      }

      // No profile API key, check daily limit
      return this.checkDailyLimit(userId);
    } catch (error) {
      console.error("Error in checkProfileApiKeyLimit:", error);
      return this.checkDailyLimit(userId); // Fallback to daily limit
    }
  }

  /**
   * Log API usage
   */
  async logUsage(log: Omit<ApiUsageLog, "id" | "created_at">): Promise<void> {
    try {
      const { error } = await this.supabase.from("api_usage_logs").insert({
        user_id: log.user_id,
        api_key_id: log.api_key_id,
        endpoint: log.endpoint,
        tokens_used: log.tokens_used,
        cost_usd: log.cost_usd,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
      });

      if (error) {
        console.error("Error logging API usage:", error);
      }

      // Update usage count in user_api_keys if applicable
      if (log.api_key_id) {
        await this.updateApiKeyUsage(log.api_key_id);
      }
    } catch (error) {
      console.error("Error in logUsage:", error);
    }
  }

  /**
   * Update API key usage statistics
   */
  private async updateApiKeyUsage(apiKeyId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("user_api_keys")
        .update({
          usage_count: this.supabase.rpc("increment"),
          last_used_at: new Date().toISOString(),
        })
        .eq("id", apiKeyId);

      if (error) {
        console.error("Error updating API key usage:", error);
      }
    } catch (error) {
      console.error("Error in updateApiKeyUsage:", error);
    }
  }

  /**
   * Get user's API usage statistics
   */
  async getUserUsageStats(userId: string): Promise<{
    totalUsage: number;
    todayUsage: number;
    hasProfileApiKey: boolean;
    limits: ApiUsageLimits;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get total usage
      const { data: totalUsage, error: totalError } = await this.supabase
        .from("api_usage_logs")
        .select("id")
        .eq("user_id", userId);

      // Get today's usage
      const { data: todayUsage, error: todayError } = await this.supabase
        .from("api_usage_logs")
        .select("id")
        .eq("user_id", userId)
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString());

      // Check if user has profile API key
      const { data: apiKey } = await this.supabase
        .from("user_api_keys")
        .select("id, is_active")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      const hasProfileApiKey = !!(apiKey && apiKey.is_active);
      const limits = await this.checkProfileApiKeyLimit(userId);

      return {
        totalUsage: totalUsage?.length || 0,
        todayUsage: todayUsage?.length || 0,
        hasProfileApiKey,
        limits: limits.limits,
      };
    } catch (error) {
      console.error("Error getting user usage stats:", error);
      return {
        totalUsage: 0,
        todayUsage: 0,
        hasProfileApiKey: false,
        limits: {
          daily_limit: 1,
          current_usage: 0,
          remaining_usage: 1,
          reset_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      };
    }
  }
}
