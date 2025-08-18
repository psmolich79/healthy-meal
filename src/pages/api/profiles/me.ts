import type { APIRoute } from "astro";
import { z } from "zod";
import { ProfileService } from "../../../lib/services/profile.service";
import type { ProfileDto, UpdatedProfileDto, DeletedProfileDto } from "../../../types";

/**
 * API endpoint for managing the current user's profile.
 *
 * This endpoint provides three operations:
 * - GET: Retrieve the current user's profile information
 * - PUT: Update the user's preferences
 * - DELETE: Schedule the profile for deletion
 *
 * All operations require authentication via JWT token in the Authorization header.
 * The endpoint uses Row-Level Security (RLS) policies to ensure users can only
 * access and modify their own profile data.
 *
 * @see {@link ProfileService} for business logic implementation
 * @see {@link ProfileDto}, {@link UpdatedProfileDto}, {@link DeletedProfileDto} for response types
 */

// Disable prerendering for this API route
export const prerender = false;

// Zod schema for validating PUT request body
const updateProfileSchema = z.object({
  preferences: z.array(z.string()).min(1, "At least one preference is required"),
});

/**
 * GET /api/profiles/me
 * Retrieves the current user's profile information.
 */
export const GET: APIRoute = async ({ locals, request }) => {
  try {
    // Debug: Check what we have in locals
    console.log("GET /api/profiles/me - locals.user:", locals.user);
    console.log("GET /api/profiles/me - locals.supabase:", !!locals.supabase);
    console.log("GET /api/profiles/me - auth header:", request.headers.get("authorization") ? "Present" : "Missing");

    // Get user and supabase client from middleware
    const { user, supabase } = locals;

    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create ProfileService instance and get profile
    const profileService = new ProfileService(supabase);
    let profile = await profileService.getProfile(user.id);

    // If profile doesn't exist, create it (for existing users who don't have profiles yet)
    if (!profile) {
      try {
        // Use ProfileService to create profile
        profile = await profileService.createProfile(user.id, []);
        console.log("Created new profile for existing user:", user.id);
      } catch (error) {
        console.error("Error creating profile:", error);
        return new Response(JSON.stringify({ error: "Failed to create profile" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Transform to ProfileDto (exclude status_changed_at)
    const profileDto: ProfileDto = {
      user_id: profile.user_id,
      preferences: profile.preferences,
      status: profile.status,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    return new Response(JSON.stringify(profileDto), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/profiles/me:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * PUT /api/profiles/me
 * Updates the current user's profile preferences.
 */
export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    // Get user and supabase client from middleware
    const { user, supabase } = locals;

    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    let body: { preferences: string[] };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate request body using Zod
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create ProfileService instance and update preferences
    const profileService = new ProfileService(supabase);
    const updatedProfile = await profileService.updatePreferences(user.id, validationResult.data.preferences);

    if (!updatedProfile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Transform to UpdatedProfileDto
    const updatedProfileDto: UpdatedProfileDto = {
      user_id: updatedProfile.user_id,
      preferences: updatedProfile.preferences,
      status: updatedProfile.status,
      updated_at: updatedProfile.updated_at,
    };

    return new Response(JSON.stringify(updatedProfileDto), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PUT /api/profiles/me:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * DELETE /api/profiles/me
 * Schedules the current user's profile for deletion.
 */
export const DELETE: APIRoute = async ({ locals }) => {
  try {
    // Get user and supabase client from middleware
    const { user, supabase } = locals;

    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create ProfileService instance and schedule deletion
    const profileService = new ProfileService(supabase);
    const profile = await profileService.scheduleDeletion(user.id);

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Transform to DeletedProfileDto
    const deletedProfileDto: DeletedProfileDto = {
      message: "Profile scheduled for deletion",
      status: profile.status,
      deletion_scheduled_at: profile.status_changed_at!,
    };

    return new Response(JSON.stringify(deletedProfileDto), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in DELETE /api/profiles/me:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
