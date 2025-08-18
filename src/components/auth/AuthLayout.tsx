import React, { useState, useCallback, useEffect } from "react";
import { AuthContainer } from "./AuthContainer";
import { AuthHeader } from "./AuthHeader";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { AuthFooter } from "./AuthFooter";
import { ErrorBoundary } from "./ErrorBoundary";
import { AuthService } from "@/lib/services/auth.service";
import { useToast } from "@/hooks/useToast";
import { ToastProvider } from "@/components/ui/toast";
import type { AuthFormType, LoginFormData, RegisterFormData, ResetPasswordFormData } from "@/types";

interface AuthLayoutProps {
  formType: AuthFormType;
  onFormSwitch?: (type: AuthFormType) => void;
  defaultEmail?: string;
}

/**
 * Main authentication layout component.
 * Orchestrates all authentication components and handles form switching.
 * Provides a unified interface for login, registration, and password reset.
 * Uses only Supabase authentication (no OAuth providers).
 */
// Internal component that uses toast
const AuthLayoutInner: React.FC<AuthLayoutProps> = ({ formType, onFormSwitch, defaultEmail }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentFormType, setCurrentFormType] = useState<AuthFormType>(formType);
  const { toast } = useToast();

  // Update currentFormType when formType prop changes
  useEffect(() => {
    setCurrentFormType(formType);
  }, [formType]);

  // Handle form switching
  const handleFormSwitch = useCallback(
    (newFormType: AuthFormType) => {
      setCurrentFormType(newFormType);

      // Try using passed prop first, then global function
      if (onFormSwitch) {
        onFormSwitch(newFormType);
      } else if (typeof window !== "undefined" && (window as any).handleFormSwitch) {
        (window as any).handleFormSwitch(newFormType);
      } else {
        // Fallback to direct navigation
        switch (newFormType) {
          case "register":
            window.location.href = "/register";
            break;
          case "reset-password":
            window.location.href = "/reset-password";
            break;
          case "login":
            window.location.href = "/login";
            break;
          default:
            break;
        }
      }
    },
    [onFormSwitch]
  );

  // Handle form submissions
  const handleLogin = useCallback(
    async (data: LoginFormData) => {
      setIsLoading(true);
      try {
        const result = await AuthService.signIn(data);
        toast.success("Zalogowano pomyślnie!");
        // Wait for session to be saved in cookies
        setTimeout(() => {
          window.location.href = "/profile";
        }, 2000);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Błąd logowania");
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const handleRegister = useCallback(async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await AuthService.signUp(data);
      toast.success("Konto zostało utworzone! Sprawdź swój email, aby potwierdzić adres.");
      window.location.href = "/profile";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd rejestracji");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResetPassword = useCallback(
    async (data: ResetPasswordFormData) => {
      setIsLoading(true);
      try {
        await AuthService.resetPassword(data);
        toast.success("Link do resetowania hasła został wysłany na podany adres email.");
        // Switch back to login form
        handleFormSwitch("login");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Błąd resetowania hasła");
      } finally {
        setIsLoading(false);
      }
    },
    [handleFormSwitch]
  );

  // Render appropriate form based on current type
  const renderForm = () => {
    switch (currentFormType) {
      case "login":
        return <LoginForm onSubmit={handleLogin} isLoading={isLoading} defaultEmail={defaultEmail} />;
      case "register":
        return <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />;
      case "reset-password":
        return <ResetPasswordForm onSubmit={handleResetPassword} isLoading={isLoading} />;
      default:
        return <LoginForm onSubmit={handleLogin} isLoading={isLoading} defaultEmail={defaultEmail} />;
    }
  };

  return (
    <ErrorBoundary>
      <AuthContainer>
        <AuthHeader formType={currentFormType} />

        {/* Main Form */}
        {renderForm()}

        {/* Footer with Navigation */}
        <AuthFooter formType={currentFormType} onFormSwitch={handleFormSwitch} />
      </AuthContainer>
    </ErrorBoundary>
  );
};

// Main export component with ToastProvider
export const AuthLayout: React.FC<AuthLayoutProps> = (props) => {
  return (
    <ToastProvider>
      <AuthLayoutInner {...props} />
    </ToastProvider>
  );
};
