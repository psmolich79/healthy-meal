import React, { useState } from "react";
import { ShoppingCart, Copy, Check } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface IngredientsSectionProps {
  ingredients: string[];
  className?: string;
}

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({ ingredients, className = "" }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyIngredients = async () => {
    try {
      const ingredientsText = ingredients.join("\n");
      await navigator.clipboard.writeText(ingredientsText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      // Error handling for clipboard operations
    }
  };

  // Ingredients are already an array, just clean them up
  const ingredientLines = ingredients
    .filter((ingredient) => ingredient.trim().length > 0)
    .map((ingredient) => ingredient.trim());

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Składniki</h2>
          </div>

          <Button variant="ghost" size="sm" onClick={handleCopyIngredients} className="text-xs">
            {isCopied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Skopiowano
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Kopiuj
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Ingredients List */}
          <div className="space-y-2">
            {ingredientLines.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{ingredient}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="pt-3 border-t text-xs text-muted-foreground">
            <p>
              📝 <strong>Łącznie:</strong> {ingredientLines.length} składników
            </p>
          </div>

          {/* Tips */}
          <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
            <p>
              💡 <strong>Wskazówka:</strong> Przed zakupami sprawdź, czy masz już niektóre składniki w domu. Możesz
              skopiować listę przyciskiem powyżej.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
