import React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GenerateButtonProps } from "./types";

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  onClick,
  disabled,
  isLoading,
  children,
  variant = "primary",
}) => {
  const handleClick = () => {
    if (!disabled && !isLoading) {
      onClick();
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      size="lg"
      className={`
        relative min-w-[200px] font-semibold transition-all duration-200
        ${
          variant === "primary"
            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
            : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
        }
        ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      aria-label={isLoading ? "Generowanie przepisu w toku..." : "Wygeneruj przepis"}
    >
      <div className="flex items-center justify-center space-x-2">
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generuję...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            <span>{children}</span>
          </>
        )}
      </div>
    </Button>
  );
};
