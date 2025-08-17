import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabaseClient } from '@/db/supabase.client';
import type { ProfileDto, UpdateProfileCommand, UpdatedProfileDto } from '@/types';

interface ProfileFormState {
  preferences: string[];
  originalPreferences: string[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  profile: ProfileDto | null;
}

interface AccordionState {
  diet: boolean;
  cuisine: boolean;
  allergies: boolean;
}

const MAX_PREFERENCES = 20;
const AUTO_SAVE_DELAY = 2000; // 2 seconds

export const useProfileForm = () => {
  const [state, setState] = useState<ProfileFormState>({
    preferences: [],
    originalPreferences: [],
    isLoading: true,
    isSaving: false,
    error: null,
    profile: null
  });

  const [accordionState, setAccordionState] = useState<AccordionState>({
    diet: true,
    cuisine: false,
    allergies: false
  });

  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      
      console.log('useProfileForm - session debug:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        accessTokenLength: session?.access_token?.length || 0,
        sessionError: sessionError?.message
      });
      
      if (sessionError || !session) {
        throw new Error('Musisz być zalogowany');
      }

      const response = await fetch('/api/profiles/me', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Profile doesn't exist, create empty one
          setState(prev => ({
            ...prev,
            isLoading: false,
            preferences: [],
            originalPreferences: [],
            profile: null
          }));
          return;
        }
        throw new Error('Błąd podczas ładowania profilu');
      }

      const profile: ProfileDto = await response.json();
      const preferences = profile.preferences || [];

      setState(prev => ({
        ...prev,
        isLoading: false,
        preferences,
        originalPreferences: [...preferences],
        profile
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Błąd podczas ładowania profilu'
      }));
    }
  }, []);

  // Save preferences
  const savePreferences = useCallback(async (preferences: string[]) => {
    try {
      setState(prev => ({ ...prev, isSaving: true, error: null }));

      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Musisz być zalogowany');
      }

      const command: UpdateProfileCommand = { preferences };

      const response = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(command)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Błąd podczas zapisywania preferencji';

        switch (response.status) {
          case 400:
            errorMessage = 'Nieprawidłowe dane wejściowe';
            break;
          case 401:
            errorMessage = 'Musisz być zalogowany';
            break;
          case 500:
            errorMessage = 'Błąd serwera. Spróbuj ponownie później';
            break;
          default:
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorMessage;
            } catch {
              // Use default message
            }
        }

        throw new Error(errorMessage);
      }

      const updatedProfile: UpdatedProfileDto = await response.json();

      setState(prev => ({
        ...prev,
        isSaving: false,
        originalPreferences: [...preferences],
        profile: prev.profile ? {
          ...prev.profile,
          preferences: updatedProfile.preferences,
          updated_at: updatedProfile.updated_at
        } : null
      }));

      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Błąd podczas zapisywania'
      }));
      return false;
    }
  }, []);

  // Update preferences with validation
  const updatePreferences = useCallback((newPreferences: string[]) => {
    // Validate max preferences
    if (newPreferences.length > MAX_PREFERENCES) {
      setState(prev => ({
        ...prev,
        error: `Maksymalnie ${MAX_PREFERENCES} preferencji`
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      preferences: newPreferences,
      error: null
    }));

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new auto-save timeout
    const timeout = setTimeout(() => {
      savePreferences(newPreferences);
    }, AUTO_SAVE_DELAY);

    setAutoSaveTimeout(timeout);
  }, [autoSaveTimeout, savePreferences]);

  // Toggle preference
  const togglePreference = useCallback((preferenceId: string) => {
    setState(prev => {
      const currentPreferences = [...prev.preferences];
      const index = currentPreferences.indexOf(preferenceId);
      
      if (index === -1) {
        // Add preference
        if (currentPreferences.length >= MAX_PREFERENCES) {
          return {
            ...prev,
            error: `Maksymalnie ${MAX_PREFERENCES} preferencji`
          };
        }
        currentPreferences.push(preferenceId);
      } else {
        // Remove preference
        currentPreferences.splice(index, 1);
      }

      return {
        ...prev,
        preferences: currentPreferences,
        error: null
      };
    });

    // Trigger auto-save
    updatePreferences(state.preferences);
  }, [state.preferences, updatePreferences]);

  // Toggle accordion section
  const toggleAccordionSection = useCallback((section: keyof AccordionState) => {
    setAccordionState(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Manual save (for immediate save button)
  const manualSave = useCallback(async () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
    return await savePreferences(state.preferences);
  }, [autoSaveTimeout, savePreferences, state.preferences]);

  // Initialize on mount
  useEffect(() => {
    fetchProfile();

    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [fetchProfile]);

  // Computed values
  const hasChanges = useMemo(() => {
    return JSON.stringify(state.preferences.sort()) !== JSON.stringify(state.originalPreferences.sort());
  }, [state.preferences, state.originalPreferences]);

  const isValid = useMemo(() => {
    return state.preferences.length <= MAX_PREFERENCES;
  }, [state.preferences]);

  const preferencesCount = useMemo(() => {
    return state.preferences.length;
  }, [state.preferences]);

  return {
    // State
    ...state,
    accordionState,
    
    // Computed values
    hasChanges,
    isValid,
    preferencesCount,
    maxPreferences: MAX_PREFERENCES,
    
    // Actions
    updatePreferences,
    togglePreference,
    toggleAccordionSection,
    savePreferences: manualSave,
    clearError,
    fetchProfile
  };
};