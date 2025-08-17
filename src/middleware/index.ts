import { defineMiddleware } from "astro:middleware";
import { supabaseClient } from "../db/supabase.client";
import { onRequest as authMiddleware } from "./auth";

/**
 * Astro middleware for authentication and Supabase client setup.
 * 
 * This middleware runs on every request and:
 * 1. Sets the Supabase client in `context.locals` for use in API routes
 * 2. Extracts and validates JWT tokens from the Authorization header
 * 3. Sets user information in `context.locals.user` if authentication succeeds
 * 
 * The middleware ensures that all API routes have access to both the Supabase client
 * and the authenticated user's information, enabling secure database operations
 * and proper authorization checks.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  // Set default supabase client in locals for use in API routes
  context.locals.supabase = supabaseClient;
  
  // Skip auth middleware for API routes (they handle auth via Authorization header)
  const url = new URL(context.request.url);
  const isApiRoute = url.pathname.startsWith('/api/');
  console.log("Middleware - URL:", url.pathname, "isApiRoute:", isApiRoute);
  
  if (!isApiRoute) {
    // Run authentication middleware for non-API routes
    const authResult = await authMiddleware(context, next);
    if (authResult) {
      return authResult; // Return redirect if auth middleware redirects
    }
  }
  
  // Check for authorization header
  const authHeader = context.request.headers.get("authorization");
  console.log("Auth header:", authHeader ? "Present" : "Missing");
  
  // Also check for cookies for debugging
  const cookies = context.request.headers.get("cookie") || "";
  console.log("Middleware - cookies present:", cookies.length > 0);
  if (cookies.length > 0) {
    console.log("Middleware - cookie names:", cookies.split(';').map(c => c.trim().split('=')[0]));
  }
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    console.log("Token received, length:", token.length);
    console.log("Token preview:", token.substring(0, 50) + "...");
    
    try {
      // For now, let's try to decode the JWT token manually to see what's in it
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log("JWT payload:", {
            sub: payload.sub,
            email: payload.email,
            exp: payload.exp,
            iat: payload.iat,
            role: payload.role
          });
          
          // Check if token is expired
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < now) {
            console.log("Token is expired! Current time:", now, "Token expires:", payload.exp);
          } else {
            console.log("Token is valid, expires at:", payload.exp);
          }
          
          // If token looks valid, set user info directly without Supabase verification
          if (payload.sub && payload.email && payload.role === 'authenticated') {
            console.log("Setting user info from JWT payload");
            context.locals.user = {
              id: payload.sub,
              email: payload.email
            };
            console.log("Set locals.user:", context.locals.user);
            
            // Create an authenticated client with the user's token
            const { createClient } = await import('@supabase/supabase-js');
            
            // Get Supabase configuration from environment variables
            const supabaseUrl = import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
            const supabaseAnonKey = import.meta.env.SUPABASE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
            
            if (!supabaseUrl || !supabaseAnonKey) {
              console.error('Supabase configuration missing in middleware');
              return next();
            }
            
            const authenticatedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
              global: {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            });
            
            // Set the authenticated client as the primary supabase client for API routes
            context.locals.authenticatedSupabase = authenticatedSupabase;
            context.locals.supabase = authenticatedSupabase; // This is the key fix - use authenticated client
            console.log("Set authenticated supabase client in locals");
          }
        } catch (decodeError) {
          console.error("Error decoding JWT payload:", decodeError);
        }
      }
      
      // Try to verify the JWT token with Supabase (fallback)
      console.log("Verifying token with Supabase...");
      const { data: { user }, error } = await supabaseClient.auth.getUser(token);
      console.log("Token verification result:", { 
        hasUser: !!user, 
        userId: user?.id, 
        error: error?.message 
      });
      
      if (!error && user) {
        console.log("User authenticated via Supabase:", user.id);
        // Set user information in locals for use in API routes
        context.locals.user = {
          id: user.id,
          email: user.email
        };
        console.log("Set locals.user:", context.locals.user);
        
        // Create an authenticated client with the user's token
        const { createClient } = await import('@supabase/supabase-js');
        
        // Get Supabase configuration from environment variables
        const supabaseUrl = import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.SUPABASE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          console.error('Supabase configuration missing in middleware');
          return next();
        }
        
        const authenticatedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        });
        
        // Set the authenticated client as the primary supabase client for API routes
        context.locals.authenticatedSupabase = authenticatedSupabase;
        context.locals.supabase = authenticatedSupabase; // This is the key fix - use authenticated client
        console.log("Set authenticated supabase client in locals");
      } else {
        console.log("Token verification failed:", error?.message);
      }
    } catch (error) {
      console.error("Error verifying JWT token:", error);
    }
  } else {
    console.log("No valid authorization header found");
  }
  
  // For API routes, continue processing
  if (isApiRoute) {
    console.log("Middleware - API route detected, locals before next():", {
      hasUser: !!context.locals.user,
      userId: context.locals.user?.id,
      hasSupabase: !!context.locals.supabase,
      supabaseType: typeof context.locals.supabase,
      hasAuthenticatedSupabase: !!context.locals.authenticatedSupabase,
      supabaseKeys: context.locals.supabase ? Object.keys(context.locals.supabase) : null,
      hasAuth: context.locals.supabase?.auth ? true : false,
      hasFrom: typeof context.locals.supabase?.from === 'function'
    });
    return next();
  }
  
  // For non-API routes, the authMiddleware would have already called next()
  return next();
});
