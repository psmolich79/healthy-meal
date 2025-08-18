import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthForm } from "@/hooks/useAuthForm";
import type { RegisterFormData } from "@/types";

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  isLoading: boolean;
}

/**
 * Registration form component with email, password, confirm password, and terms acceptance.
 * Includes enhanced password validation and real-time field validation.
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading }) => {
  const { formData, errors, updateField, handleSubmit } = useAuthForm("register");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await handleSubmit();

    if (isValid) {
      onSubmit({
        email: formData.email,
        password: formData.password || "",
        confirmPassword: formData.confirmPassword || "",
        acceptTerms: formData.acceptTerms || false,
      });
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, color: "bg-slate-200" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;

    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
    return { strength, color: colors[Math.min(strength - 1, 3)] };
  };

  const passwordStrength = getPasswordStrength(formData.password || "");

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
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
        />
        {errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Hasło
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Wprowadź hasło"
          value={formData.password || ""}
          onChange={(e) => updateField("password", e.target.value)}
          className={errors.password ? "border-red-500 focus:border-red-500" : ""}
          disabled={isLoading}
          required
        />

        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="space-y-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded ${
                    level <= passwordStrength.strength ? passwordStrength.color : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Siła hasła: {passwordStrength.strength}/4</p>
          </div>
        )}

        {errors.password && <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Potwierdź hasło
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Potwierdź hasło"
          value={formData.confirmPassword || ""}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
          className={errors.confirmPassword ? "border-red-500 focus:border-red-500" : ""}
          disabled={isLoading}
          required
        />
        {errors.confirmPassword && <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
      </div>

      {/* Terms Acceptance Checkbox */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="acceptTerms"
          checked={formData.acceptTerms || false}
          onCheckedChange={(checked) => updateField("acceptTerms", checked as boolean)}
          disabled={isLoading}
          className="mt-1"
        />
        <div className="space-y-1">
          <Label
            htmlFor="acceptTerms"
            className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer leading-relaxed"
          >
            Akceptuję{" "}
            <a
              href="/terms"
              className="text-blue-600 hover:text-blue-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              warunki użytkowania
            </a>{" "}
            i{" "}
            <a
              href="/privacy"
              className="text-blue-600 hover:text-blue-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              politykę prywatności
            </a>
          </Label>
          {errors.acceptTerms && <p className="text-sm text-red-600 dark:text-red-400">{errors.acceptTerms}</p>}
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
        {isLoading ? "Tworzenie konta..." : "Zarejestruj się"}
      </Button>

      {/* General Error */}
      {errors.general && <p className="text-sm text-red-600 dark:text-red-400 text-center">{errors.general}</p>}
    </form>
  );
};
