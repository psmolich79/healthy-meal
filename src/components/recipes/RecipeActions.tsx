import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SaveButton } from "./SaveButton";
import { RatingControls } from "./RatingControls";
import { RegenerateButton } from "./RegenerateButton";
import type { RecipeDetailsDto, RatingType } from "@/types";

interface RecipeActionsProps {
  recipe: RecipeDetailsDto;
  isSaved: boolean;
  onSave: () => Promise<boolean>;
  onRatingChange: (rating: RatingType) => Promise<boolean>;
  onRatingRemove: () => Promise<boolean>;
  onRegenerate: () => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export const RecipeActions: React.FC<RecipeActionsProps> = ({
  recipe,
  isSaved,
  onSave,
  onRatingChange,
  onRatingRemove,
  onRegenerate,
  isLoading = false,
  className = "",
}) => {
  const canRegenerate = recipe.user_rating === "down";

  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-6">
        {/* Actions Header */}
        <div className="text-center space-y-2">
          <h3 className="font-semibold">Akcje przepisu</h3>
          <p className="text-sm text-muted-foreground">Oceń przepis, zapisz go lub wygeneruj nową wersję</p>
        </div>

        {/* Save Action */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Zapisz przepis</h4>
          <div className="flex justify-center">
            <SaveButton isSaved={isSaved} onClick={onSave} isLoading={isLoading} disabled={isLoading} />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Zapisane przepisy znajdziesz w sekcji "Moje przepisy"
          </p>
        </div>

        <Separator />

        {/* Rating Action */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Oceń przepis</h4>
          <RatingControls
            currentRating={recipe.user_rating}
            onRatingChange={onRatingChange}
            onRatingRemove={onRatingRemove}
            disabled={isLoading}
          />
        </div>

        {/* Regenerate Action */}
        {canRegenerate && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Nie podoba Ci się przepis?</h4>
              <RegenerateButton
                isVisible={canRegenerate}
                onClick={onRegenerate}
                isLoading={isLoading}
                disabled={isLoading}
              />
            </div>
          </>
        )}

        {/* Help Section */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <h5 className="text-sm font-medium">Jak to działa?</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>
              • <strong>Zapisz:</strong> Dodaj przepis do swojej kolekcji
            </li>
            <li>
              • <strong>👍 Podoba mi się:</strong> Pozytywna ocena pomoże AI lepiej dopasować przyszłe przepisy
            </li>
            <li>
              • <strong>👎 Nie podoba mi się:</strong> Negatywna ocena odblokowuje opcję regeneracji
            </li>
            <li>
              • <strong>Wygeneruj ponownie:</strong> Stwórz nową wersję przepisu z tymi samymi preferencjami
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
