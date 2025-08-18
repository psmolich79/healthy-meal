import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  isVisible: boolean;
  status?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner = React.memo<LoadingSpinnerProps>(({ isVisible, status, size = "md", className }) => {
  if (!isVisible) return null;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <div
        className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-blue-600", sizeClasses[size])}
        role="status"
        aria-label="Ładowanie"
      />
      {status && <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{status}</p>}
    </div>
  );
});
