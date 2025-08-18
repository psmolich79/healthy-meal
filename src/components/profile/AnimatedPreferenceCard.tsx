import React from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PreferenceItem } from "@/data/preferences";

interface AnimatedPreferenceCardProps {
  preference: PreferenceItem;
  isSelected: boolean;
  onToggle: (preferenceId: string) => void;
  disabled?: boolean;
}

export const AnimatedPreferenceCard: React.FC<AnimatedPreferenceCardProps> = ({
  preference,
  isSelected,
  onToggle,
  disabled = false,
}) => {
  const handleClick = () => {
    if (!disabled) {
      onToggle(preference.id);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "severe":
        return "destructive";
      case "moderate":
        return "secondary";
      case "mild":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Card
      className={`
        relative cursor-pointer transition-all duration-200 hover:shadow-md
        ${isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      onClick={handleClick}
    >
      <div className="p-4 space-y-3">
        {/* Header with icon and selection indicator */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl" role="img" aria-label={preference.label}>
              {preference.icon}
            </span>
            {preference.flag && (
              <span className="text-sm" role="img" aria-label="Flag">
                {preference.flag}
              </span>
            )}
          </div>

          {/* Selection indicator */}
          <div
            className={`
            flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all
            ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"}
          `}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{preference.label}</h3>
            {preference.severity && (
              <Badge variant={getSeverityColor(preference.severity)} className="text-xs">
                {preference.severity === "severe" && "Poważne"}
                {preference.severity === "moderate" && "Umiarkowane"}
                {preference.severity === "mild" && "Łagodne"}
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">{preference.description}</p>
        </div>
      </div>

      {/* Animated border effect */}
      <div
        className={`
        absolute inset-0 rounded-lg transition-all duration-300
        ${isSelected ? "shadow-lg shadow-primary/20" : ""}
      `}
      />
    </Card>
  );
};
