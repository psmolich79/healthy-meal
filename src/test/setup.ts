import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { SupabaseClient } from "@supabase/supabase-js";

// Mock environment variables for Supabase
vi.mock("@/db/supabase.client", () => ({
  supabaseClient: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: "mock-token",
            expires_at: Date.now() / 1000 + 3600, // 1 hour from now
          },
        },
        error: null,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: "test-user-id",
            email: "test@example.com",
          },
        },
        error: null,
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      onAuthStateChange: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(() => createMockQueryBuilder()),
  },
}));

// Mock AuthService
vi.mock("@/lib/services/auth.service", () => ({
  AuthService: {
    getAuthHeaders: vi.fn().mockResolvedValue({
      Authorization: "Bearer mock-token",
      "Content-Type": "application/json",
    }),
    ensureValidSession: vi.fn().mockResolvedValue(true),
    getAuthToken: vi.fn().mockResolvedValue("mock-token"),
    getCurrentSession: vi.fn().mockResolvedValue({
      access_token: "mock-token",
      expires_at: Date.now() / 1000 + 3600,
    }),
    getCurrentUser: vi.fn().mockResolvedValue({
      id: "test-user-id",
      email: "test@example.com",
    }),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    signInWithGoogle: vi.fn(),
    refreshSession: vi.fn(),
    updatePassword: vi.fn(),
    isAuthenticated: vi.fn().mockReturnValue(true),
    onAuthStateChange: vi.fn(),
  },
}));

// Mock ResizeObserver for tests
global.ResizeObserver = class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// Mock fetch API
global.fetch = vi.fn();

// Helper function to create a mock query builder with proper method chaining
const createMockQueryBuilder = (methods: Record<string, any> = {}) => {
  const mockBuilder = {
    select: vi.fn(() => mockBuilder),
    insert: vi.fn(() => mockBuilder),
    update: vi.fn(() => mockBuilder),
    delete: vi.fn(() => mockBuilder),
    eq: vi.fn(() => mockBuilder),
    neq: vi.fn(() => mockBuilder),
    gt: vi.fn(() => mockBuilder),
    gte: vi.fn(() => mockBuilder),
    lt: vi.fn(() => mockBuilder),
    lte: vi.fn(() => mockBuilder),
    like: vi.fn(() => mockBuilder),
    ilike: vi.fn(() => mockBuilder),
    in: vi.fn(() => mockBuilder),
    not: vi.fn(() => mockBuilder),
    or: vi.fn(() => mockBuilder),
    and: vi.fn(() => mockBuilder),
    order: vi.fn(() => mockBuilder),
    range: vi.fn(() => mockBuilder),
    limit: vi.fn(() => mockBuilder),
    single: vi.fn(() => mockBuilder),
    maybeSingle: vi.fn(() => mockBuilder),
    count: vi.fn(() => mockBuilder),
    ...methods,
  };
  return mockBuilder;
};

// Mock Supabase client with proper method chaining
export const mockSupabase = {
  auth: {
    getSession: vi.fn(),
  },
  from: vi.fn(() => createMockQueryBuilder()),
} as unknown as SupabaseClient;

// Mock context
export const createMockContext = (overrides = {}) =>
  ({
    request: new Request("http://localhost:3000"),
    params: {},
    url: new URL("http://localhost:3000"),
    locals: {
      supabase: mockSupabase,
    },
    site: "http://localhost:3000",
    generator: "Astro",
    props: {},
    redirect: vi.fn(),
    cookies: {} as any,
    get: vi.fn(),
    set: vi.fn(),
    ...overrides,
  }) as any;

// Mock authenticated user
export const mockUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "test@example.com",
};

// Mock recipe data
export const mockRecipe = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  title: "Test Recipe",
  ingredients: "Test ingredients",
  shopping_list: "Test shopping list",
  instructions: "Test instructions",
  query: "Test query",
  is_visible: true,
  user_id: mockUser.id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock rating data
export const mockRating = {
  recipe_id: mockRecipe.id,
  user_id: mockUser.id,
  rating: "up" as const,
  created_at: new Date().toISOString(),
};

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  vi.resetAllMocks();
  cleanup();
});
