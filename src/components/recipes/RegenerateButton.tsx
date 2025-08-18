import React, { useState } from "react";
import { RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RegenerateButtonProps {
  isVisible: boolean;
  onClick: () => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
  className?: string;
}

export const RegenerateButton: React.FC<RegenerateButtonProps> = ({
  isVisible,
  onClick,
  isLoading,
  disabled = false,
  className = "",
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (!isVisible) return null;

  const handleConfirmRegenerate = async () => {
    setShowConfirmDialog(false);
    await onClick();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Info Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Widzimy, że ten przepis Ci się nie podoba. Możesz wygenerować nową wersję z tymi samymi preferencjami, ale
          innymi składnikami i instrukcjami.
        </AlertDescription>
      </Alert>

      {/* Regenerate Button */}
      <div className="flex justify-center">
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              disabled={disabled || isLoading}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generowanie...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Wygeneruj ponownie
                </>
              )}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Wygenerować nowy przepis?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  AI wygeneruje nowy przepis na podstawie Twoich preferencji i oryginalnego zapytania. Nowy przepis
                  będzie miał inne składniki i instrukcje.
                </p>
                <p className="text-sm text-muted-foreground">
                  ⚠️ Obecny przepis pozostanie dostępny w Twojej historii.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Anuluj</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmRegenerate} className="bg-primary hover:bg-primary/90">
                Tak, wygeneruj nowy
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Additional Info */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>🔄 Regeneracja może potrwać do 30 sekund</p>
        <p>💡 Nowy przepis będzie uwzględniać Twoje preferencje żywieniowe</p>
      </div>
    </div>
  );
};
