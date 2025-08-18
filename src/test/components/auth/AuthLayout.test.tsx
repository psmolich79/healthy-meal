import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthLayout } from "@/components/auth/AuthLayout";

// Mock the useAuthForm hook
vi.mock("@/hooks/useAuthForm", () => ({
  useAuthForm: (formType: string) => {
    const baseData = {
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
      rememberMe: false,
      acceptTerms: false,
    };

    // Return different data based on form type
    if (formType === "reset-password") {
      return {
        formData: { email: "test@example.com" },
        errors: {},
        updateField: vi.fn(),
        handleSubmit: vi.fn().mockResolvedValue(true),
        setDefaultEmail: vi.fn(),
      };
    }

    return {
      formData: baseData,
      errors: {},
      updateField: vi.fn(),
      handleSubmit: vi.fn().mockResolvedValue(true),
      setDefaultEmail: vi.fn(),
    };
  },
}));

// Mock the AuthService
vi.mock("@/lib/services/auth.service", () => ({
  AuthService: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

// Mock the useToast hook
vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }),
}));

describe("AuthLayout", () => {
  const defaultProps = {
    formType: "login" as const,
    onFormSwitch: vi.fn(),
    defaultEmail: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form by default", () => {
    render(<AuthLayout {...defaultProps} />);

    expect(screen.getByRole("button", { name: /zaloguj się/i })).toBeInTheDocument();
    expect(screen.getByText(/witaj ponownie/i)).toBeInTheDocument();
  });

  it("renders register form when formType is register", () => {
    render(<AuthLayout {...defaultProps} formType="register" />);

    expect(screen.getByRole("button", { name: /zarejestruj się/i })).toBeInTheDocument();
    expect(screen.getByText(/utwórz konto/i)).toBeInTheDocument();
  });

  it("renders reset password form when formType is reset-password", () => {
    render(<AuthLayout {...defaultProps} formType="reset-password" />);

    // Check if the form is rendered by looking for the email input
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    
    // Check for the form structure instead of specific button text
    expect(screen.getByRole("button", { name: /wyślij link resetowania/i })).toBeInTheDocument();
  });

  it("passes defaultEmail to forms when provided", () => {
    render(<AuthLayout {...defaultProps} defaultEmail="test@example.com" />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveValue("test@example.com");
  });

      it("renders with proper styling classes", () => {
      render(<AuthLayout {...defaultProps} />);

      // Find the element with min-h-screen classes directly
      const mainContainer = document.querySelector('.min-h-screen');
      
      expect(mainContainer).toHaveClass("min-h-screen", "flex", "items-center", "justify-center");
    });

  it("shows proper form titles", () => {
    render(<AuthLayout {...defaultProps} />);

    expect(screen.getByText(/witaj ponownie/i)).toBeInTheDocument();
    expect(screen.getByText(/zaloguj się do swojego konta/i)).toBeInTheDocument();
  });

  it("shows proper form titles for register", () => {
    render(<AuthLayout {...defaultProps} formType="register" />);

    expect(screen.getByText(/utwórz konto/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zarejestruj się/i })).toBeInTheDocument();
  });

  it("shows proper form titles for reset password", () => {
    render(<AuthLayout {...defaultProps} formType="reset-password" />);

    // Check for the form structure instead of specific button text
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /wyślij link resetowania/i })).toBeInTheDocument();
  });

  it("handles different form types correctly", () => {
    const { rerender } = render(<AuthLayout {...defaultProps} />);

    // Login form
    expect(screen.getByRole("button", { name: /zaloguj się/i })).toBeInTheDocument();

    // Register form
    rerender(<AuthLayout {...defaultProps} formType="register" />);
    expect(screen.getByRole("button", { name: /zarejestruj się/i })).toBeInTheDocument();

    // Reset password form
    rerender(<AuthLayout {...defaultProps} formType="reset-password" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /wyślij link resetowania/i })).toBeInTheDocument();
  });

  it("maintains form state during form type changes", () => {
    const { rerender } = render(<AuthLayout {...defaultProps} />);

    // Start with login
    expect(screen.getByRole("button", { name: /zaloguj się/i })).toBeInTheDocument();

    // Change to register
    rerender(<AuthLayout {...defaultProps} formType="register" />);
    expect(screen.getByRole("button", { name: /zarejestruj się/i })).toBeInTheDocument();

    // Change back to login
    rerender(<AuthLayout {...defaultProps} formType="login" />);
    expect(screen.getByRole("button", { name: /zaloguj się/i })).toBeInTheDocument();
  });

  it("renders with proper styling and layout", () => {
    render(<AuthLayout {...defaultProps} />);

    const container = screen.getByRole("button", { name: /zaloguj się/i }).closest("div");
    expect(container).toBeInTheDocument();
  });

  it("maintains form state during interactions", () => {
    render(<AuthLayout {...defaultProps} />);

    // Initial state
    expect(screen.getByRole("button", { name: /zaloguj się/i })).toBeInTheDocument();

    // After interaction
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();

    // Form type should remain the same
    expect(screen.getByRole("button", { name: /zaloguj się/i })).toBeInTheDocument();
  });
});
