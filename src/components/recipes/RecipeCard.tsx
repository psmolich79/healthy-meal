import React, { useState } from "react";
import { Calendar, Eye, EyeOff, MoreVertical, Trash2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import type { RecipeListItemDto } from "@/types";

interface RecipeCardProps {
  recipe: RecipeListItemDto;
  onClick: (recipeId: string) => void;
  onDelete: (recipeId: string) => void;
  className?: string;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick, onDelete, className = "" }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const truncateTitle = (title: string, maxLength = 60) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
  };

  const handleCardClick = () => {
    onClick(recipe.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(recipe.id);
    setShowDeleteDialog(false);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getRatingBadge = () => {
    if (!recipe.user_rating) return null;

    return (
      <Badge variant={recipe.user_rating === "up" ? "default" : "secondary"} className="text-xs">
        {recipe.user_rating === "up" ? "👍" : "👎"}
      </Badge>
    );
  };

  return (
    <>
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group ${className}`}
        onClick={handleCardClick}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header with title and menu */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm leading-tight mb-1">{truncateTitle(recipe.title)}</h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onClick(recipe.id)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Otwórz przepis
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Usuń przepis
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(recipe.created_at)}</span>
            </div>

            {getRatingBadge()}
          </div>

          {/* Status badges */}
          <div className="flex items-center justify-between">
            <Badge variant={recipe.is_visible ? "outline" : "secondary"} className="text-xs">
              {recipe.is_visible ? (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Publiczny
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Prywatny
                </>
              )}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCardClick}
          >
            Zobacz szczegóły
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń przepis</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć przepis "{recipe.title}"? Ta akcja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Usuń przepis
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
