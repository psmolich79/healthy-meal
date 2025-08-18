import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthForm } from "@/hooks/useAuthForm";
import type { ResetPasswordFormData } from "@/types";

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => void;
  isLoading: boolean;
}

/**
 * Password reset form component with email field.
 * Provides simple and focused interface for password reset requests.
 */
export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSubmit, isLoading }) => {
  const { formData, errors, updateField, handleSubmit } = useAuthForm("reset-password");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await handleSubmit();

    if (isValid) {
      onSubmit({
        email: formData.email,
      });
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Info Text */}
      <div className="text-center">
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          Wprowadź swój adres email, a my wyślemy Ci link do resetowania hasła. Link będzie aktywny przez 24 godziny.
        </p>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="twoj@email.com"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          className={errors.email ? "border-red-500 focus:border-red-500" : ""}
          disabled={isLoading}
          required
          // autoFocus removed for accessibility
        />
        {errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={isLoading}>
        {isLoading ? "Wysyłanie..." : "Wyślij link resetowania"}
      </Button>

      {/* General Error */}
      {errors.general && <p className="text-sm text-red-600 dark:text-red-400 text-center">{errors.general}</p>}

      {/* Additional Info */}
      <div className="text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Nie otrzymałeś emaila? Sprawdź folder spam lub{" "}
          <button
            type="button"
            onClick={() => updateField("email", formData.email)}
            className="text-blue-600 hover:text-blue-700 underline"
            disabled={isLoading}
          >
            spróbuj ponownie
          </button>
        </p>
      </div>
    </form>
  );
};
