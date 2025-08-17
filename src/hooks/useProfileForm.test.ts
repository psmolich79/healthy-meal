// Mock AuthService
vi.mock('@/lib/services/auth.service', () => ({
  AuthService: {
    getAuthHeaders: vi.fn().mockResolvedValue({
      'Authorization': 'Bearer mock-token',
      'Content-Type': 'application/json'
    }),
    ensureValidSession: vi.fn().mockImplementation(() => {
      console.log('Mock ensureValidSession called, returning true');
      return Promise.resolve(true);
    }),
    getAuthToken: vi.fn().mockResolvedValue('mock-token'),
    getCurrentSession: vi.fn().mockResolvedValue({
      access_token: 'mock-token',
      expires_at: Date.now() / 1000 + 3600
    }),
    getCurrentUser: vi.fn().mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com'
    }),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    signInWithGoogle: vi.fn(),
    refreshSession: vi.fn(),
    updatePassword: vi.fn(),
    isAuthenticated: vi.fn().mockReturnValue(true),
    onAuthStateChange: vi.fn()
  }
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProfileForm } from './useProfileForm';

// Mock fetch globally
global.fetch = vi.fn();

// Mock console.error to avoid noise in tests
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('useProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy.mockClear();
  });

  describe('initialization', () => {
    it('should initialize with default state', async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ preferences: [] })
      } as Response);

      const { result } = renderHook(() => useProfileForm());

      // Wait for loadProfile to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.preferences).toEqual([]);
      expect(result.current.originalPreferences).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.accordionState).toEqual({
        diet: true,
        cuisine: false,
        allergies: false
      });
    });

      it('should initialize with empty preferences', () => {
    const { result } = renderHook(() => useProfileForm());

    expect(result.current.preferences).toEqual([]);
    expect(result.current.originalPreferences).toEqual([]);
  });
  });

  describe('preferences management', () => {
    it('should update preferences', async () => {
      const { result } = renderHook(() => useProfileForm());

      // Wait for profile to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.updatePreferences(['vegetarian', 'italian']);
      });

      // Order doesn't matter for this test
      expect(result.current.preferences).toContain('vegetarian');
      expect(result.current.preferences).toContain('italian');
    });

    it('should toggle single preference', async () => {
      const { result } = renderHook(() => useProfileForm());

      // Wait for profile to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.togglePreference('vegetarian');
      });

      expect(result.current.preferences).toContain('vegetarian');

      act(() => {
        result.current.togglePreference('vegetarian'); // Toggle off
      });

      expect(result.current.preferences).not.toContain('vegetarian');
    });

    it('should clear error when preferences change', async () => {
      const { result } = renderHook(() => useProfileForm());

      // Wait for profile to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Change preferences should clear error
      act(() => {
        result.current.updatePreferences(['vegetarian']);
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('accordion management', () => {
    it('should toggle accordion sections', () => {
      const { result } = renderHook(() => useProfileForm());

      act(() => {
        result.current.toggleAccordionSection('cuisine');
      });

      expect(result.current.accordionState.cuisine).toBe(true);

      act(() => {
        result.current.toggleAccordionSection('cuisine');
      });

      expect(result.current.accordionState.cuisine).toBe(false);
    });

    it('should toggle accordion sections correctly', () => {
      const { result } = renderHook(() => useProfileForm());

      act(() => {
        result.current.toggleAccordionSection('cuisine');
      });

      expect(result.current.accordionState.cuisine).toBe(true);

      act(() => {
        result.current.toggleAccordionSection('cuisine');
      });

      expect(result.current.accordionState.cuisine).toBe(false);
    });
  });

  describe('validation', () => {
      it('should validate maximum preferences limit', () => {
    const manyPrefs = Array.from({ length: 21 }, (_, i) => `pref${i}`);
    const { result } = renderHook(() => useProfileForm());

    act(() => {
      result.current.updatePreferences(manyPrefs);
    });

    expect(result.current.error).toBe('Maksymalnie 20 preferencji');
    expect(result.current.isValid).toBe(true); // isValid is computed from preferences length
  });
  });

  describe('save preferences', () => {
    it('should not save when no changes', async () => {
      const { result } = renderHook(() => useProfileForm());

      // Wait for profile to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const success = await act(async () => {
        return await result.current.savePreferences();
      });

      expect(success).toBe(false);
      expect(result.current.isSaving).toBe(false);
    });


  });

  describe('load profile', () => {
    it('should load profile successfully', async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          preferences: ['vegetarian', 'italian'],
          status: 'active',
          user_id: 'test-user-id'
        })
      });

      const { result } = renderHook(() => useProfileForm());

      // Wait for profile to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.preferences).toEqual(['vegetarian', 'italian']);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle unauthorized error', async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const { result } = renderHook(() => useProfileForm());

      // Wait for profile to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.error).toBe('Błąd podczas ładowania profilu');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle profile not found error', async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const { result } = renderHook(() => useProfileForm());

      // Wait for profile to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.preferences).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('computed values', () => {
    it('should detect changes correctly', () => {
      const { result } = renderHook(() => useProfileForm());

      expect(result.current.hasChanges).toBe(false);

      act(() => {
        result.current.updatePreferences(['vegetarian', 'vegan']);
      });

      expect(result.current.hasChanges).toBe(true);
    });
  });
});
