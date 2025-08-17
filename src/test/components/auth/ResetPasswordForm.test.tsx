import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

// Mock the useAuthForm hook
vi.mock('@/hooks/useAuthForm', () => ({
  useAuthForm: vi.fn()
}));

const mockUseAuthForm = vi.mocked(require('@/hooks/useAuthForm').useAuthForm);

describe('ResetPasswordForm', () => {
  const mockOnSubmit = vi.fn();
  const mockUpdateField = vi.fn();
  const mockHandleSubmit = vi.fn();

  const defaultFormData = {
    email: '',
    password: '',
    confirmPassword: '',
    token: ''
  };

  const defaultErrors = {
    email: '',
    password: '',
    confirmPassword: '',
    token: ''
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuthForm.mockReturnValue({
      formData: defaultFormData,
      errors: defaultErrors,
      updateField: mockUpdateField,
      handleSubmit: mockHandleSubmit
    });
  });

  it('renders all form fields', () => {
    render(<ResetPasswordForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nowe hasło/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/potwierdź nowe hasło/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/token resetowania/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zresetuj hasło/i })).toBeInTheDocument();
  });

  it('calls updateField when input values change', () => {
    render(<ResetPasswordForm onSubmit={mockOnSubmit} isLoading={false} />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(mockUpdateField).toHaveBeenCalledWith('email', 'test@example.com');
  });

  it('shows error messages when errors exist', () => {
    const errorsWithMessages = {
      ...defaultErrors,
      email: 'Email jest wymagany',
      password: 'Hasło jest za krótkie'
    };

    mockUseAuthForm.mockReturnValue({
      formData: defaultFormData,
      errors: errorsWithMessages,
      updateField: mockUpdateField,
      handleSubmit: mockHandleSubmit
    });

    render(<ResetPasswordForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByText('Email jest wymagany')).toBeInTheDocument();
    expect(screen.getByText('Hasło jest za krótkie')).toBeInTheDocument();
  });

  it('calls handleSubmit when form is submitted', async () => {
    mockHandleSubmit.mockResolvedValue(true);

    render(<ResetPasswordForm onSubmit={mockOnSubmit} isLoading={false} />);

    const submitButton = screen.getByRole('button', { name: /zresetuj hasło/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });

  it('calls onSubmit with form data when validation passes', async () => {
    const formData = {
      email: 'test@example.com',
      password: 'NewTest123!',
      confirmPassword: 'NewTest123!',
      token: 'reset-token-123'
    };

    mockUseAuthForm.mockReturnValue({
      formData,
      errors: defaultErrors,
      updateField: mockUpdateField,
      handleSubmit: mockHandleSubmit
    });

    mockHandleSubmit.mockResolvedValue(true);

    render(<ResetPasswordForm onSubmit={mockOnSubmit} isLoading={false} />);

    const submitButton = screen.getByRole('button', { name: /zresetuj hasło/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'NewTest123!',
        confirmPassword: 'NewTest123!',
        token: 'reset-token-123'
      });
    });
  });

  it('does not call onSubmit when validation fails', async () => {
    mockHandleSubmit.mockResolvedValue(false);

    render(<ResetPasswordForm onSubmit={mockOnSubmit} isLoading={false} />);

    const submitButton = screen.getByRole('button', { name: /zresetuj hasło/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('disables form fields when loading', () => {
    render(<ResetPasswordForm onSubmit={mockOnSubmit} isLoading={true} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/nowe hasło/i);
    const submitButton = screen.getByRole('button', { name: /zresetuj hasło/i });

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('applies error styling to fields with errors', () => {
    const errorsWithMessages = {
      ...defaultErrors,
      email: 'Email jest wymagany'
    };

    mockUseAuthForm.mockReturnValue({
      formData: defaultFormData,
      errors: errorsWithMessages,
      updateField: mockUpdateField,
      handleSubmit: mockHandleSubmit
    });

    render(<ResetPasswordForm onSubmit={mockOnSubmit} isLoading={false} />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveClass('border-red-500');
  });

  it('handles token input field', () => {
    render(<ResetPasswordForm onSubmit={mockOnSubmit} isLoading={false} />);

    const tokenInput = screen.getByLabelText(/token resetowania/i);
    fireEvent.change(tokenInput, { target: { value: 'test-token' } });

    expect(mockUpdateField).toHaveBeenCalledWith('token', 'test-token');
  });

  it('shows password requirements when password field is focused', () => {
    render(<ResetPasswordForm onSubmit={mockOnSubmit} isLoading={false} />);

    const passwordInput = screen.getByLabelText(/nowe hasło/i);
    fireEvent.focus(passwordInput);

    // Password requirements should be visible
    expect(screen.getByText(/co najmniej 8 znaków/i)).toBeInTheDocument();
    expect(screen.getByText(/wielka litera/i)).toBeInTheDocument();
    expect(screen.getByText(/mała litera/i)).toBeInTheDocument();
    expect(screen.getByText(/cyfra/i)).toBeInTheDocument();
  });

  it('displays password strength indicator when password is entered', () => {
    mockUseAuthForm.mockReturnValue({
      formData: { ...defaultFormData, password: 'Test123' },
      errors: defaultErrors,
      updateField: mockUpdateField,
      handleSubmit: mockHandleSubmit
    });

    render(<ResetPasswordForm onSubmit={mockOnSubmit} isLoading={false} />);

    // Password strength bars should be visible
    const strengthBars = screen.getAllByTestId('password-strength-bar');
    expect(strengthBars.length).toBeGreaterThan(0);
  });
});
