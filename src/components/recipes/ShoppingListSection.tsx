import React, { useState } from "react";
import { ShoppingBag, Copy, Check } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface ShoppingListSectionProps {
  shoppingList: string[];
  className?: string;
}

export const ShoppingListSection: React.FC<ShoppingListSectionProps> = ({ shoppingList, className = "" }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const handleCopyShoppingList = async () => {
    try {
      const shoppingListText = shoppingList.join("\n");
      await navigator.clipboard.writeText(shoppingListText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy shopping list:", error);
    }
  };

  const toggleItemCheck = (index: number) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(index)) {
      newCheckedItems.delete(index);
    } else {
      newCheckedItems.add(index);
    }
    setCheckedItems(newCheckedItems);
  };

  const clearAllChecks = () => {
    setCheckedItems(new Set());
  };

  // Parse shopping list into categories and items
  const parseShoppingList = (text: string[]) => {
    const lines = text.filter((line) => line.trim().length > 0);
    const categories: Record<string, string[]> = {};
    let currentCategory = "Ogólne";

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Check if line is a category (contains colon or is all caps)
      if (trimmedLine.includes(":") || (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 2)) {
        currentCategory = trimmedLine.replace(":", "").trim();
        if (!categories[currentCategory]) {
          categories[currentCategory] = [];
        }
      } else {
        // It's an item
        if (!categories[currentCategory]) {
          categories[currentCategory] = [];
        }
        categories[currentCategory].push(trimmedLine);
      }
    });

    return categories;
  };

  const categories = parseShoppingList(shoppingList);
  const totalItems = Object.values(categories).flat().length;
  const checkedCount = checkedItems.size;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5 text-secondary" />
            <h2 className="text-xl font-semibold">Lista zakupowa</h2>
          </div>

          <div className="flex items-center space-x-2">
            {checkedCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllChecks} className="text-xs">
                Wyczyść
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleCopyShoppingList} className="text-xs">
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
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Progress */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Postęp zakupów:</span>
              <span>
                {checkedCount}/{totalItems} ({Math.round((checkedCount / totalItems) * 100)}%)
              </span>
            </div>
          )}

          {/* Shopping List by Categories */}
          <div className="space-y-4">
            {Object.entries(categories).map(([categoryName, items], categoryIndex) => (
              <div key={categoryIndex} className="space-y-2">
                {/* Category Header */}
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">{categoryName}</h3>

                {/* Category Items */}
                <div className="space-y-2 pl-4">
                  {items.map((item, itemIndex) => {
                    const globalIndex = Object.values(categories).flat().indexOf(item);
                    const isChecked = checkedItems.has(globalIndex);

                    return (
                      <button
                        key={itemIndex}
                        type="button"
                        className={`w-full text-left flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-all ${
                          isChecked ? "opacity-60 line-through" : ""
                        }`}
                        onClick={() => toggleItemCheck(globalIndex)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleItemCheck(globalIndex);
                          }
                        }}
                      >
                        <Checkbox
                          checked={isChecked}
                          onChange={() => toggleItemCheck(globalIndex)}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="text-sm">{item}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="pt-3 border-t text-xs text-muted-foreground">
            <p>
              🛒 <strong>Do kupienia:</strong> {totalItems - checkedCount} z {totalItems} produktów
            </p>
          </div>

          {/* Tips */}
          <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
            <p>
              💡 <strong>Wskazówka:</strong> Zaznaczaj produkty podczas zakupów. Lista jest zorganizowana według działów
              sklepowych dla Twojej wygody.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
