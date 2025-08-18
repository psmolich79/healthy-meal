import { useCallback } from "react";
import { useToast as useToastContext } from "@/components/ui/toast";

/**
 * Custom hook for showing toast notifications.
 * Provides a simplified interface for common toast operations.
 */
export const useToast = () => {
  const { addToast } = useToastContext();

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      switch (type) {
        case "success":
          addToast({
            type: "success",
            title: "Sukces",
            message: message,
          });
          break;
        case "error":
          addToast({
            type: "error",
            title: "Błąd",
            message: message,
          });
          break;
        case "info":
        default:
          addToast({
            type: "info",
            title: "Informacja",
            message: message,
          });
          break;
      }
    },
    [addToast]
  );

  const showSuccess = useCallback(
    (message: string) => {
      showToast(message, "success");
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string) => {
      showToast(message, "error");
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string) => {
      showToast(message, "info");
    },
    [showToast]
  );

  return {
    toast: {
      success: showSuccess,
      error: showError,
      info: showInfo,
    },
  };
};
