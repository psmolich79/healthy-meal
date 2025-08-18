import React from "react";
import { Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  hasChanges: boolean;
  className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ onClick, disabled, isLoading, hasChanges, className = "" }) => {
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Zapisywanie...</span>
        </>
      );
    }

    if (!hasChanges) {
      return (
        <>
          <Check className="h-4 w-4" />
          <span>Zapisano</span>
        </>
      );
    }

    return (
      <>
        <Save className="h-4 w-4" />
        <span>Zapisz zmiany</span>
      </>
    );
  };

  const getVariant = () => {
    if (!hasChanges) return "outline";
    return "default";
  };

  const shouldDisable = disabled || isLoading || !hasChanges;

  return (
    <Button
      onClick={onClick}
      disabled={shouldDisable}
      variant={getVariant()}
      size="lg"
      className={`
        min-w-[160px] transition-all duration-200
        ${hasChanges ? "shadow-md" : ""}
        ${className}
      `}
    >
      <div className="flex items-center space-x-2">{getButtonContent()}</div>
    </Button>
  );
};
