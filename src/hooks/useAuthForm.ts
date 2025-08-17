import { useState, useCallback } from 'react';
import type { 
  AuthFormType, 
  AuthFormData, 
  ValidationErrors, 
  ValidationResult,
  LoginFormData,
  RegisterFormData,
  ResetPasswordFormData
} from '../types';

/**
 * Custom hook for managing authentication form state and validation.
 * Provides form data management, real-time validation, and submission handling.
 */
export const useAuthForm = (formType: AuthFormType) => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    acceptTerms: false
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Validates a single field in real-time.
   */
  const validateField = useCallback((field: keyof AuthFormData, value: string | boolean): string | null => {
    switch (field) {
      case 'email':
        if (!value || typeof value !== 'string') {
          return 'Email jest wymagany';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Wprowadź poprawny adres email';
        }
        return null;

      case 'password':
        if (!value || typeof value !== 'string') {
          return 'Hasło jest wymagane';
        }
        if (value.length < 8) {
          return 'Hasło musi mieć minimum 8 znaków';
        }
        if (formType === 'register') {
          const hasUpperCase = /[A-Z]/.test(value);
          const hasLowerCase = /[a-z]/.test(value);
          const hasNumbers = /\d/.test(value);
          
          if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            return 'Hasło musi zawierać wielką literę, małą literę i cyfrę';
          }
        }
        return null;

      case 'confirmPassword':
        if (formType === 'register' && value !== formData.password) {
          return 'Hasła nie są identyczne';
        }
        return null;

      case 'acceptTerms':
        if (formType === 'register' && !value) {
          return 'Musisz zaakceptować warunki użytkowania';
        }
        return null;

      default:
        return null;
    }
  }, [formType, formData.password]);

  /**
   * Validates the entire form before submission.
   */
  const validateForm = useCallback((): ValidationResult => {
    const newErrors: ValidationErrors = {};

    // Validate email
    const emailError = validateField('email', formData.email);
    if (emailError) newErrors.email = emailError;

    // Validate password for login and register
    if (formType !== 'reset-password') {
      const passwordError = validateField('password', formData.password || '');
      if (passwordError) newErrors.password = passwordError;
    }

    // Validate confirm password for register
    if (formType === 'register') {
      const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword || '');
      if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

      const termsError = validateField('acceptTerms', formData.acceptTerms || false);
      if (termsError) newErrors.acceptTerms = termsError;
    }

    const isValid = Object.keys(newErrors).length === 0;
    return { isValid, errors: newErrors };
  }, [formData, formType, validateField]);

  /**
   * Updates form data and validates the field in real-time.
   */
  const updateField = useCallback((field: keyof AuthFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear existing error for this field
    setErrors(prev => ({ ...prev, [field]: undefined }));
    
    // Validate field in real-time
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [validateField]);

  /**
   * Handles form submission with validation.
   */
  const handleSubmit = useCallback(async (): Promise<boolean> => {
    console.log('useAuthForm handleSubmit called, formData:', formData);
    const validation = validateForm();
    console.log('Validation result:', validation);
    
    if (!validation.isValid) {
      console.log('Validation failed, setting errors:', validation.errors);
      setErrors(validation.errors);
      return false;
    }

    console.log('Validation passed, form ready for submission');
    setIsLoading(true);
    setErrors({});
    
    try {
      // Form is valid, ready for submission
      return true;
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setErrors({ general: 'Wystąpił błąd podczas przetwarzania formularza' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, formData]);

  /**
   * Resets the form to initial state.
   */
  const resetForm = useCallback(() => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
      acceptTerms: false
    });
    setErrors({});
    setIsLoading(false);
  }, []);

  /**
   * Sets a default email value (useful for pre-filling from URL params).
   */
  const setDefaultEmail = useCallback((email: string) => {
    setFormData(prev => ({ ...prev, email }));
  }, []);

  return {
    formData,
    errors,
    isLoading,
    updateField,
    handleSubmit,
    resetForm,
    setDefaultEmail,
    validateField,
    validateForm
  };
};
