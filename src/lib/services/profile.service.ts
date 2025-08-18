import type { SupabaseClient } from "../../db/supabase.client";
import type { Profile, ProfileDto, UpdatedProfileDto, DeletedProfileDto } from "../../types";

/**
 * Service for managing user profile operations.
 *
 * This service provides a clean interface for all profile-related database operations,
 * including profile retrieval, preference updates, and deletion scheduling.
 * It handles error cases gracefully and provides detailed logging for debugging.
 *
 * @example
 * ```typescript
 * const profileService = new ProfileService(supabaseClient);
 * const profile = await profileService.getProfile(userId);
 * ```
 */
export class ProfileService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Retrieves the profile for a given user ID.
   * @param userId - The ID of the user whose profile to retrieve
   * @returns Promise resolving to the profile data or null if not found
   */
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase.from("profiles").select("*").eq("user_id", userId).single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error retrieving profile:", error);
      throw error;
    }
  }

  /**
   * Creates a new profile for a user.
   * @param userId - The ID of the user for whom to create a profile
   * @param preferences - Initial preferences array (defaults to empty)
   * @returns Promise resolving to the created profile data
   */
  async createProfile(userId: string, preferences: string[] = []): Promise<Profile> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .insert({
          user_id: userId,
          preferences,
          status: "active",
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  }

  /**
   * Updates user preferences for a given user ID.
   * @param userId - The ID of the user whose preferences to update
   * @param preferences - Array of preference strings to set
   * @returns Promise resolving to the updated profile data or null if update failed
   */
  async updatePreferences(userId: string, preferences: string[]): Promise<UpdatedProfileDto | null> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .update({
          preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select("user_id, preferences, status, updated_at")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error updating profile preferences:", error);
      throw error;
    }
  }

  /**
   * Schedules a user profile for deletion by setting status to 'deletion_scheduled'.
   * @param userId - The ID of the user whose profile to schedule for deletion
   * @returns Promise resolving to the updated profile data or null if update failed
   */
  async scheduleDeletion(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .update({
          status: "pending_deletion",
          status_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error scheduling profile deletion:", error);
      throw error;
    }
  }
}
