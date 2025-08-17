import { supabaseClient } from '@/db/supabase.client';
import type { LoginFormData, RegisterFormData, ResetPasswordFormData } from '@/types';

/**
 * Authentication service for handling user authentication operations.
 * Integrates with Supabase Auth API for login, registration, OAuth, and password reset.
 */
export class AuthService {
  /**
   * Signs up a new user with email and password.
   */
  static async signUp(data: RegisterFormData) {
    const { data: authData, error } = await supabaseClient.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
        data: {
          email_confirmed: false
        }
      }
    });

    if (error) {
      throw new Error(this.getErrorMessage(error));
    }

    return authData;
  }

  /**
   * Signs in a user with email and password.
   */
  static async signIn(data: LoginFormData) {
    const { data: authData, error } = await supabaseClient.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (error) {
      throw new Error(this.getErrorMessage(error));
    }

    return authData;
  }

  /**
   * Signs in a user with Google OAuth.
   */
  static async signInWithGoogle() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profile`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) {
      throw new Error(this.getErrorMessage(error));
    }

    return data;
  }

  /**
   * Sends a password reset email.
   */
  static async resetPassword(data: ResetPasswordFormData) {
    const { data: resetData, error } = await supabaseClient.auth.resetPasswordForEmail(
      data.email,
      {
        redirectTo: `${window.location.origin}/reset-password/confirm`
      }
    );

    if (error) {
      throw new Error(this.getErrorMessage(error));
    }

    return resetData;
  }

  /**
   * Signs out the current user.
   */
  static async signOut() {
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Gets the current user session.
   */
  static async getCurrentSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (error) {
      throw new Error(this.getErrorMessage(error));
    }

    return session;
  }

  /**
   * Gets the current user.
   */
  static async getCurrentUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error) {
      throw new Error(this.getErrorMessage(error));
    }

    return user;
  }

  /**
   * Refreshes the current user session.
   */
  static async refreshSession() {
    const { data: { session }, error } = await supabaseClient.auth.refreshSession();
    
    if (error) {
      throw new Error(this.getErrorMessage(error));
    }

    return session;
  }

  /**
   * Updates the current user's password.
   */
  static async updatePassword(newPassword: string) {
    const { data, error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new Error(this.getErrorMessage(error));
    }

    return data;
  }

  /**
   * Converts Supabase error messages to user-friendly Polish messages.
   */
  private static getErrorMessage(error: any): string {
    const errorMessage = error?.message || 'Wystąpił nieoczekiwany błąd';
    
    // Map common Supabase auth errors to Polish
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Nieprawidłowy email lub hasło',
      'Email not confirmed': 'Email nie został potwierdzony. Sprawdź swoją skrzynkę odbiorczą.',
      'User already registered': 'Ten adres email jest już zarejestrowany',
      'Password should be at least 6 characters': 'Hasło musi mieć minimum 6 znaków',
      'Unable to validate email address: invalid format': 'Nieprawidłowy format adresu email',
      'User not found': 'Użytkownik nie został znaleziony',
      'Too many requests': 'Zbyt wiele prób. Spróbuj ponownie za chwilę.',
      'Email rate limit exceeded': 'Przekroczono limit prób. Spróbuj ponownie za chwilę.',
      'Signup disabled': 'Rejestracja jest obecnie wyłączona',
      'Signup not allowed': 'Rejestracja nie jest dozwolona',
      'OAuth provider not supported': 'Ten sposób logowania nie jest obsługiwany',
      'OAuth account not linked': 'Konto OAuth nie jest połączone',
      'OAuth provider error': 'Błąd podczas logowania przez Google',
      'Network error': 'Błąd sieci. Sprawdź połączenie internetowe.',
      'Service unavailable': 'Usługa jest niedostępna. Spróbuj ponownie później.'
    };

    // Try to find a Polish translation
    for (const [english, polish] of Object.entries(errorMap)) {
      if (errorMessage.toLowerCase().includes(english.toLowerCase())) {
        return polish;
      }
    }

    // Return original message if no translation found
    return errorMessage;
  }

  /**
   * Checks if the current user is authenticated.
   */
  static isAuthenticated(): boolean {
    const session = supabaseClient.auth.getSession();
    return !!session;
  }

  /**
   * Listens to authentication state changes.
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabaseClient.auth.onAuthStateChange(callback);
  }

  /**
   * Gets authentication headers for API requests.
   */
  static async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await this.getCurrentSession();
    if (!session?.access_token) {
      throw new Error('Brak tokenu uwierzytelniającego');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Ensures the current session is valid and refreshes if needed.
   */
  static async ensureValidSession(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      if (!session) {
        return false;
      }

      // Check if session is expired or about to expire (within 5 minutes)
      const expiresAt = new Date(session.expires_at! * 1000);
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      if (expiresAt <= fiveMinutesFromNow) {
        // Session is expired or about to expire, try to refresh
        await this.refreshSession();
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  /**
   * Gets the current authentication token.
   */
  static async getAuthToken(): Promise<string> {
    const session = await this.getCurrentSession();
    if (!session?.access_token) {
      throw new Error('Brak tokenu uwierzytelniającego');
    }
    
    return session.access_token;
  }
}
