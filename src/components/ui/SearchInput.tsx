import React, { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
  maxLength?: number;
  label?: string;
  helpText?: string;
  showCharacterCount?: boolean;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Szukaj...",
  disabled = false,
  maxLength = 500,
  label,
  helpText,
  showCharacterCount = true,
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= maxLength) {
        onChange(newValue);
      }
    },
    [onChange, maxLength]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSubmit && !disabled) {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit, disabled]
  );

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const hasContent = value.trim().length > 0;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="search-input" className="text-sm font-medium">
          {label}
        </Label>
      )}

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search-input"
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={`pl-10 pr-10 ${isFocused ? "ring-2 ring-primary" : ""}`}
            aria-describedby={showCharacterCount ? "character-count" : undefined}
          />

          {hasContent && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0 hover:bg-muted"
              aria-label="Wyczyść"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {(helpText || showCharacterCount) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {helpText && <span>{helpText}</span>}
          {showCharacterCount && (
            <span
              id="character-count"
              className={`tabular-nums ${isNearLimit ? "text-warning" : ""} ${characterCount === maxLength ? "text-destructive" : ""}`}
              aria-live="polite"
            >
              {characterCount}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
