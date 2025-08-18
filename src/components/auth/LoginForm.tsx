import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthForm } from "@/hooks/useAuthForm";
import type { LoginFormData } from "@/types";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
  defaultEmail?: string;
}

/**
 * Login form component with email, password, and remember me functionality.
 * Integrates with useAuthForm hook for state management and validation.
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, defaultEmail }) => {
  const { formData, errors, updateField, handleSubmit } = useAuthForm("login");

  // Set default email if provided
  React.useEffect(() => {
    if (defaultEmail) {
      updateField("email", defaultEmail);
    }
  }, [defaultEmail, updateField]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await handleSubmit();

    if (isValid) {
      onSubmit({
        email: formData.email,
        password: formData.password || "",
        rememberMe: formData.rememberMe || false,
      });
    }
  };

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
        {errors.password && <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rememberMe"
          checked={formData.rememberMe || false}
          onCheckedChange={(checked) => updateField("rememberMe", checked as boolean)}
          disabled={isLoading}
        />
        <Label htmlFor="rememberMe" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          Zapamiętaj mnie
        </Label>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
        {isLoading ? "Logowanie..." : "Zaloguj się"}
      </Button>

      {/* General Error */}
      {errors.general && <p className="text-sm text-red-600 dark:text-red-400 text-center">{errors.general}</p>}
    </form>
  );
};
