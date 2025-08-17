import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface OAuthButtonsProps {
  onGoogleLogin: () => void;
  isLoading: boolean;
  className?: string;
}

/**
 * OAuth authentication buttons component.
 * Provides Google OAuth login with proper styling and separators.
 */
export const OAuthButtons: React.FC<OAuthButtonsProps> = ({ 
  onGoogleLogin, 
  isLoading, 
  className 
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Separator */}
      <div className="relative">
        <Separator className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-300 dark:border-slate-600" />
        </Separator>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
            Lub kontynuuj z
          </span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="outline"
        onClick={onGoogleLogin}
        disabled={isLoading}
        className="w-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        <svg
          className="mr-2 h-4 w-4"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 488 512"
        >
          <path
            fill="currentColor"
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h240z"
          />
        </svg>
        {isLoading ? 'Przetwarzanie...' : 'Kontynuuj z Google'}
      </Button>

      {/* Additional OAuth providers can be added here */}
      <div className="text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Logując się przez Google, akceptujesz nasze{' '}
          <a 
            href="/terms" 
            className="text-blue-600 hover:text-blue-700 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            warunki użytkowania
          </a>
        </p>
      </div>
    </div>
  );
};
