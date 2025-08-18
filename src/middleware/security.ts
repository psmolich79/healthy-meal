import type { MiddlewareResponseHandler } from "astro";

// Security headers configuration
const SECURITY_HEADERS = {
  // Prevent clickjacking
  "X-Frame-Options": "DENY",

  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // XSS protection
  "X-XSS-Protection": "1; mode=block",

  // Referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions policy
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",

  // Cross-origin embedding policy
  "Cross-Origin-Embedder-Policy": "require-corp",

  // Cross-origin opener policy
  "Cross-Origin-Opener-Policy": "same-origin",

  // Cross-origin resource policy
  "Cross-Origin-Resource-Policy": "same-origin",

  // Strict transport security (HTTPS only)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
} as const;

// Content Security Policy
const CSP_POLICY = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'", // Required for Astro
    "'unsafe-eval'", // Required for some frameworks
    "https://unpkg.com", // For development dependencies
  ],
  "style-src": [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind
    "https://fonts.googleapis.com",
  ],
  "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
  "img-src": ["'self'", "data:", "https:", "blob:"],
  "connect-src": ["'self'", "https://api.supabase.co", "https://*.supabase.co", "ws:", "wss:"],
  "frame-src": ["'none'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "upgrade-insecure-requests": [],
} as const;

// Function to build CSP string
function buildCSPString(policy: Record<string, string[]>): string {
  return Object.entries(policy)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(" ")}`;
    })
    .join("; ");
}

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
} as const;

// IP address extraction
function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  // Fallback for local development
  return "127.0.0.1";
}

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_CONFIG.maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Input validation helpers
export const inputValidators = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  // Username validation
  isValidUsername: (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  },

  // Password strength validation
  isStrongPassword: (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // Sanitize HTML input
  sanitizeHtml: (input: string): string => {
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  },

  // Validate preference IDs
  isValidPreferenceId: (id: string): boolean => {
    const validIds = [
      "vegetarian",
      "vegan",
      "keto",
      "paleo",
      "mediterranean",
      "low-carb",
      "gluten-free",
      "dairy-free",
      "italian",
      "asian",
      "mexican",
      "indian",
      "french",
      "greek",
      "japanese",
      "thai",
      "gluten",
      "lactose",
      "nuts",
      "shellfish",
      "eggs",
      "soy",
      "fish",
      "sesame",
    ];
    return validIds.includes(id);
  },
};

// Security middleware
export const securityMiddleware: MiddlewareResponseHandler = async ({ request, locals }, next) => {
  const startTime = Date.now();

  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: RATE_LIMIT_CONFIG.message,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(RATE_LIMIT_CONFIG.windowMs / 1000).toString(),
          },
        }
      );
    }

    // Security headers
    const response = await next();

    // Add security headers
    Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
      response.headers.set(header, value);
    });

    // Add CSP header
    const cspString = buildCSPString(CSP_POLICY);
    response.headers.set("Content-Security-Policy", cspString);

    // Add request timing header
    const duration = Date.now() - startTime;
    response.headers.set("X-Response-Time", `${duration}ms`);

    // Add request ID for tracking
    const requestId = crypto.randomUUID();
    response.headers.set("X-Request-ID", requestId);

    // Log security events
    if (duration > 1000) {
      console.warn(`Slow request detected: ${request.method} ${request.url} - ${duration}ms`);
    }

    return response;
  } catch (error) {
    console.error("Security middleware error:", error);

    // Return generic error to avoid information leakage
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  }
};

// CORS configuration for API routes
export const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGINS || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400", // 24 hours
};

// CORS middleware for API routes
export const corsMiddleware: MiddlewareResponseHandler = async ({ request }, next) => {
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const response = await next();

  // Add CORS headers to all API responses
  Object.entries(corsHeaders).forEach(([header, value]) => {
    response.headers.set(header, value);
  });

  return response;
};

// Export security utilities
export const securityUtils = {
  inputValidators,
  getClientIP,
  checkRateLimit,
  buildCSPString,
  SECURITY_HEADERS,
  CSP_POLICY,
  RATE_LIMIT_CONFIG,
};
