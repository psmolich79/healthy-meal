import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuthForm } from "@/hooks/useAuthForm";
import type { AuthFormType } from "@/types";

describe("useAuthForm", () => {
  const renderUseAuthForm = (formType: AuthFormType = "login") => {
    return renderHook(() => useAuthForm(formType));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("initializes with empty form data for login form", () => {
      const { result } = renderUseAuthForm("login");

      expect(result.current.formData).toEqual({
        email: "",
        password: "",
        confirmPassword: "",
        rememberMe: false,
        acceptTerms: false,
      });
    });

    it("initializes with empty form data for register form", () => {
      const { result } = renderUseAuthForm("register");

      expect(result.current.formData).toEqual({
        email: "",
        password: "",
        confirmPassword: "",
        rememberMe: false,
        acceptTerms: false,
      });
    });

    it("initializes with empty form data for reset-password form", () => {
      const { result } = renderUseAuthForm("reset-password");

      expect(result.current.formData).toEqual({
        email: "",
        password: "",
        confirmPassword: "",
        rememberMe: false,
        acceptTerms: false,
      });
    });

    it("initializes with empty errors", () => {
      const { result } = renderUseAuthForm();

      expect(result.current.errors).toEqual({});
    });

    it("initializes with loading state false", () => {
      const { result } = renderUseAuthForm();

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("updateField", () => {
    it("updates email field correctly", () => {
      const { result } = renderUseAuthForm();

      act(() => {
        result.current.updateField("email", "test@example.com");
      });

      expect(result.current.formData.email).toBe("test@example.com");
    });

    it("updates password field correctly", () => {
      const { result } = renderUseAuthForm();

      act(() => {
        result.current.updateField("password", "newpassword123");
      });

      expect(result.current.formData.password).toBe("newpassword123");
    });

    it("updates rememberMe field correctly", () => {
      const { result } = renderUseAuthForm();

      act(() => {
        result.current.updateField("rememberMe", true);
      });

      expect(result.current.formData.rememberMe).toBe(true);
    });

    it("updates acceptTerms field correctly", () => {
      const { result } = renderUseAuthForm("register");

      act(() => {
        result.current.updateField("acceptTerms", true);
      });

      expect(result.current.formData.acceptTerms).toBe(true);
    });
  });

  describe("validateField", () => {
    it("validates email field correctly", () => {
      const { result } = renderUseAuthForm();

      // Invalid email
      const invalidEmailError = result.current.validateField("email", "invalid-email");
      expect(invalidEmailError).toBe("Wprowadź poprawny adres email");

      // Valid email
      const validEmailError = result.current.validateField("email", "test@example.com");
      expect(validEmailError).toBeNull();
    });

    it("validates password field correctly", () => {
      const { result } = renderUseAuthForm();

      // Too short password
      const shortPasswordError = result.current.validateField("password", "123");
      expect(shortPasswordError).toBe("Hasło musi mieć minimum 8 znaków");

      // Valid password
      const validPasswordError = result.current.validateField("password", "Password123");
      expect(validPasswordError).toBeNull();
    });

    it("validates password with enhanced requirements for register form", () => {
      const { result } = renderUseAuthForm("register");

      // Password without uppercase
      const noUpperCaseError = result.current.validateField("password", "password123");
      expect(noUpperCaseError).toBe("Hasło musi zawierać wielką literę, małą literę i cyfrę");

      // Password without lowercase
      const noLowerCaseError = result.current.validateField("password", "PASSWORD123");
      expect(noLowerCaseError).toBe("Hasło musi zawierać wielką literę, małą literę i cyfrę");

      // Password without numbers
      const noNumbersError = result.current.validateField("password", "PasswordABC");
      expect(noNumbersError).toBe("Hasło musi zawierać wielką literę, małą literę i cyfrę");

      // Valid password
      const validPasswordError = result.current.validateField("password", "Password123");
      expect(validPasswordError).toBeNull();
    });

    it("validates confirmPassword field correctly", () => {
      const { result } = renderUseAuthForm("register");

      // Set password first
      act(() => {
        result.current.updateField("password", "Password123");
      });

      // Mismatched passwords
      const mismatchError = result.current.validateField("confirmPassword", "Different123");
      expect(mismatchError).toBe("Hasła nie są identyczne");

      // Matching passwords
      const matchError = result.current.validateField("confirmPassword", "Password123");
      expect(matchError).toBeNull();
    });

    it("validates acceptTerms field correctly", () => {
      const { result } = renderUseAuthForm("register");

      // Terms not accepted
      const notAcceptedError = result.current.validateField("acceptTerms", false);
      expect(notAcceptedError).toBe("Musisz zaakceptować warunki użytkowania");

      // Terms accepted
      const acceptedError = result.current.validateField("acceptTerms", true);
      expect(acceptedError).toBeNull();
    });
  });

  describe("validateForm", () => {
    it("returns valid result for complete login form", () => {
      const { result } = renderUseAuthForm("login");

      // Fill required fields
      act(() => {
        result.current.updateField("email", "test@example.com");
        result.current.updateField("password", "Password123");
      });

      const validation = result.current.validateForm();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual({});
    });

    it("returns invalid result for incomplete login form", () => {
      const { result } = renderUseAuthForm("login");

      // Leave email empty
      act(() => {
        result.current.updateField("password", "Password123");
      });

      const validation = result.current.validateForm();
      expect(validation.isValid).toBe(false);
      expect(validation.errors.email).toBe("Email jest wymagany");
    });

    it("returns valid result for complete register form", () => {
      const { result } = renderUseAuthForm("register");

      // Fill all required fields
      act(() => {
        result.current.updateField("email", "test@example.com");
        result.current.updateField("password", "Password123");
        result.current.updateField("confirmPassword", "Password123");
        result.current.updateField("acceptTerms", true);
      });

      const validation = result.current.validateForm();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual({});
    });

    it("returns invalid result for incomplete register form", () => {
      const { result } = renderUseAuthForm("register");

      // Fill only email
      act(() => {
        result.current.updateField("email", "test@example.com");
      });

      const validation = result.current.validateForm();
      expect(validation.isValid).toBe(false);
      expect(validation.errors.password).toBe("Hasło jest wymagane");
    });

    it("returns valid result for reset-password form with email", () => {
      const { result } = renderUseAuthForm("reset-password");

      // Fill email
      act(() => {
        result.current.updateField("email", "test@example.com");
      });

      const validation = result.current.validateForm();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual({});
    });
  });

  describe("setDefaultEmail", () => {
    it("sets default email correctly", () => {
      const { result } = renderUseAuthForm();

      act(() => {
        result.current.setDefaultEmail("default@example.com");
      });

      expect(result.current.formData.email).toBe("default@example.com");
    });
  });

  describe("resetForm", () => {
    it("resets form to initial state", () => {
      const { result } = renderUseAuthForm();

      // Fill some fields
      act(() => {
        result.current.updateField("email", "test@example.com");
        result.current.updateField("password", "Password123");
        result.current.updateField("rememberMe", true);
      });

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData).toEqual({
        email: "",
        password: "",
        confirmPassword: "",
        rememberMe: false,
        acceptTerms: false,
      });
      expect(result.current.errors).toEqual({});
      expect(result.current.isLoading).toBe(false);
    });
  });
});
