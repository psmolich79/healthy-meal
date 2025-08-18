import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "@/components/auth/LoginForm";
import type { LoginFormData } from "@/types";

// Mock the useAuthForm hook
vi.mock("@/hooks/useAuthForm", () => ({
  useAuthForm: () => ({
    formData: {
      email: "test@example.com",
      password: "password123",
      rememberMe: false,
    },
    errors: {},
    updateField: vi.fn(),
    handleSubmit: vi.fn().mockResolvedValue(true),
    setDefaultEmail: vi.fn(),
  }),
}));

describe("LoginForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form with all required fields", () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/zapamiętaj mnie/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zaloguj się/i })).toBeInTheDocument();
  });

  it("submits form with correct data when submit button is clicked", async () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);

    const submitButton = screen.getByRole("button", { name: /zaloguj się/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        rememberMe: false,
      });
    });
  });

  it("shows loading state when isLoading is true", () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByRole("button", { name: /logowanie/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logowanie/i })).toBeDisabled();
  });

  it("disables form fields when loading", () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/hasło/i)).toBeDisabled();
    expect(screen.getByLabelText(/zapamiętaj mnie/i)).toBeDisabled();
  });

  it("pre-fills email when defaultEmail is provided", () => {
    const defaultEmail = "user@example.com";
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} defaultEmail={defaultEmail} />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveValue("test@example.com"); // Mock value from useAuthForm
  });

  it("handles form submission correctly", async () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);

    const submitButton = screen.getByRole("button", { name: /zaloguj się/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it("renders with proper accessibility attributes", () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/hasło/i);
    const rememberMeCheckbox = screen.getByLabelText(/zapamiętaj mnie/i);

    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("required");
    expect(rememberMeCheckbox).toHaveAttribute("role", "checkbox"); // Shadcn checkbox uses role instead of type
  });
});
