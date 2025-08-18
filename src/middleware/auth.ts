import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";

/**
 * Authentication middleware for protecting routes and handling auth state.
 * Redirects authenticated users away from auth pages and protects private routes.
 */
export const onRequest = defineMiddleware(async ({ request, redirect, locals }, next) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Create Supabase client with access to request cookies
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase configuration missing in auth middleware");
    return next();
  }

  // Get cookies from request
  const cookies = request.headers.get("cookie") || "";
  console.log("Auth middleware - cookies:", cookies);

  // Find Supabase auth token cookie dynamically
  const authTokenMatch = cookies.match(/sb-[^-]+-auth-token=([^;]+)/);
  if (authTokenMatch) {
    console.log("Auth middleware - found auth token cookie");
    console.log("Auth middleware - raw cookie value:", authTokenMatch[1]);

    // Try to decode and parse the cookie value
    try {
      const decodedValue = decodeURIComponent(authTokenMatch[1]);
      console.log("Auth middleware - decoded cookie value length:", decodedValue.length);
      console.log("Auth middleware - decoded cookie value preview:", decodedValue.substring(0, 100) + "...");

      const parsedValue = JSON.parse(decodedValue);
      console.log("Auth middleware - parsed cookie value keys:", Object.keys(parsedValue));
    } catch (error) {
      console.error("Auth middleware - error parsing cookie:", error);
    }
  } else {
    console.log("Auth middleware - no auth token cookie found");
  }

  // Create Supabase client that can read cookies
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key: string) => {
          console.log("Auth middleware - getItem called for key:", key);

          // For auth token, look for the actual cookie name
          if (key.includes("auth-token")) {
            console.log("Auth middleware - getItem called for auth token key:", key);
            const match = cookies.match(/sb-[^-]+-auth-token=([^;]+)/);
            if (match) {
              console.log("Auth middleware - found auth token cookie in getItem");
              try {
                const decodedValue = decodeURIComponent(match[1]);
                console.log("Auth middleware - returning decoded value, length:", decodedValue.length);
                return decodedValue;
              } catch (error) {
                console.error("Auth middleware - error decoding cookie in getItem:", error);
                return match[1];
              }
            } else {
              console.log("Auth middleware - no auth token cookie found in getItem");
            }
          }

          // For other keys, try exact match
          const match = cookies.match(new RegExp(`(^| )${key}=([^;]+)`));
          if (match) {
            console.log("Auth middleware - found cookie value for key:", key);
            try {
              return decodeURIComponent(match[2]);
            } catch {
              return match[2];
            }
          }

          console.log("Auth middleware - no cookie found for key:", key);
          return null;
        },
        setItem: () => {}, // Not needed for middleware
        removeItem: () => {}, // Not needed for middleware
      },
      autoRefreshToken: true, // Enable auto-refresh to use storage
      persistSession: true, // Enable persistence to use storage
      detectSessionInUrl: false,
    },
  });

  // Get current session
  console.log("Auth middleware - calling supabase.auth.getSession()");
  console.log("Auth middleware - before getSession, cookies available:", cookies.length > 0);

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Auth middleware - error getting session:", error);
  }

  console.log("Auth middleware - session result:", {
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    error: error?.message,
  });

  // Store auth state in locals for use in components
  (locals as any).auth = {
    user: session?.user || null,
    session: session,
    isAuthenticated: !!session,
  };

  // Store authenticated Supabase client for API routes
  (locals as any).supabase = supabase;
  (locals as any).authenticatedSupabase = supabase;

  // Auth pages that should redirect authenticated users
  const authPages = ["/login", "/register", "/reset-password"];
  const isAuthPage = authPages.includes(pathname);

  // Protected pages that require authentication
  const protectedPages = ["/profile", "/recipes/generate", "/recipes"];
  const isProtectedPage = protectedPages.some((page) => pathname.startsWith(page));

  // Redirect authenticated users away from auth pages
  if (isAuthPage && session) {
    return redirect("/profile");
  }

  // Redirect unauthenticated users away from protected pages
  if (isProtectedPage && !session) {
    // Store intended destination for post-login redirect
    const redirectUrl = new URL("/login", url);
    redirectUrl.searchParams.set("redirect", pathname);
    return redirect(redirectUrl.toString());
  }

  // Continue to the next middleware or route
  return next();
});

// Extend Astro's Locals interface
declare namespace App {
  interface Locals {
    auth: {
      user: any;
      session: any;
      isAuthenticated: boolean;
    };
    supabase: any;
    authenticatedSupabase: any;
  }
}
