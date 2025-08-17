import React from 'react';
import { Button } from '@/components/ui/button';

interface SaveButtonProps {
  isSaved: boolean;
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({ isSaved, onClick, isLoading, disabled }) => (
  <Button onClick={onClick} disabled={disabled || isLoading}>
    {isLoading ? 'Zapisywanie...' : isSaved ? 'Zapisano' : 'Zapisz'}
  </Button>
);

export { SaveButton };
