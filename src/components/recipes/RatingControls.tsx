import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { RatingType } from '@/types';

interface RatingControlsProps {
  currentRating: RatingType | null;
  onRatingChange: (rating: RatingType) => Promise<boolean>;
  onRatingRemove: () => Promise<boolean>;
  disabled?: boolean;
  className?: string;
}

export const RatingControls: React.FC<RatingControlsProps> = ({
  currentRating,
  onRatingChange,
  onRatingRemove,
  disabled = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRatingClick = async (rating: RatingType) => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    const success = await onRatingChange(rating);
    setIsLoading(false);

    if (success && rating === 'down') {
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 5000);
    }
  };

  const handleRemoveRating = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    await onRatingRemove();
    setIsLoading(false);
  };

  const isUpSelected = currentRating === 'up';
  const isDownSelected = currentRating === 'down';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Rating Buttons */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-muted-foreground">
          Oceń przepis:
        </span>
        
        <div className="flex items-center space-x-1">
          {/* Thumbs Up */}
          <Button
            variant={isUpSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRatingClick('up')}
            disabled={disabled || isLoading}
            className={`transition-all ${
              isUpSelected 
                ? 'bg-green-600 hover:bg-green-700 border-green-600' 
                : 'hover:bg-green-50 hover:border-green-300'
            }`}
          >
            {isLoading && currentRating !== 'up' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ThumbsUp className={`h-4 w-4 ${isUpSelected ? 'text-white' : 'text-green-600'}`} />
            )}
            <span className={`ml-1 text-xs ${isUpSelected ? 'text-white' : 'text-green-600'}`}>
              Podoba mi się
            </span>
          </Button>

          {/* Thumbs Down */}
          <Button
            variant={isDownSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRatingClick('down')}
            disabled={disabled || isLoading}
            className={`transition-all ${
              isDownSelected 
                ? 'bg-red-600 hover:bg-red-700 border-red-600' 
                : 'hover:bg-red-50 hover:border-red-300'
            }`}
          >
            {isLoading && currentRating !== 'down' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ThumbsDown className={`h-4 w-4 ${isDownSelected ? 'text-white' : 'text-red-600'}`} />
            )}
            <span className={`ml-1 text-xs ${isDownSelected ? 'text-white' : 'text-red-600'}`}>
              Nie podoba mi się
            </span>
          </Button>

          {/* Remove Rating */}
          {currentRating && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveRating}
              disabled={disabled || isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
              <span className="ml-1 text-xs">Usuń ocenę</span>
            </Button>
          )}
        </div>
      </div>

      {/* Current Rating Display */}
      {currentRating && (
        <div className="text-xs text-muted-foreground">
          Twoja ocena: {currentRating === 'up' ? '👍 Pozytywna' : '👎 Negatywna'}
        </div>
      )}

      {/* Confirmation for negative rating */}
      {showConfirmation && isDownSelected && (
        <Alert>
          <AlertDescription>
            Dzięki za opinię! Jeśli przepis Ci się nie podoba, możesz wygenerować nową wersję 
            używając przycisku "Wygeneruj ponownie" poniżej.
          </AlertDescription>
        </Alert>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground">
        💡 Twoja ocena pomoże nam lepiej dostosować przyszłe przepisy do Twoich preferencji
      </div>
    </div>
  );
};