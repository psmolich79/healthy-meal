import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { AuthFormType } from '@/types';

interface AuthFooterProps {
  formType: AuthFormType;
  onFormSwitch: (type: AuthFormType) => void;
}

/**
 * Footer component for authentication forms.
 * Provides navigation links to switch between different auth screens.
 */
export const AuthFooter: React.FC<AuthFooterProps> = ({ 
  formType, 
  onFormSwitch 
}) => {
  const getFooterContent = () => {
    switch (formType) {
      case 'login':
        return {
          question: 'Nie masz jeszcze konta?',
          action: 'Zarejestruj się',
          switchTo: 'register' as const,
          additionalLinks: [
            { text: 'Zapomniałeś hasła?', action: 'reset-password' as const }
          ]
        };
      case 'register':
        return {
          question: 'Masz już konto?',
          action: 'Zaloguj się',
          switchTo: 'login' as const,
          additionalLinks: []
        };
      case 'reset-password':
        return {
          question: 'Pamiętasz hasło?',
          action: 'Zaloguj się',
          switchTo: 'login' as const,
          additionalLinks: [
            { text: 'Nie masz konta?', action: 'register' as const }
          ]
        };
      default:
        return {
          question: 'Masz już konto?',
          action: 'Zaloguj się',
          switchTo: 'login' as const,
          additionalLinks: []
        };
    }
  };

  const { question, action, switchTo, additionalLinks } = getFooterContent();

  return (
    <div className="space-y-4 pt-6">
      {/* Separator */}
      <Separator className="my-4" />
      
      {/* Main Action */}
      <div className="text-center">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {question}{' '}
        </span>
        <Button
          variant="link"
          onClick={() => onFormSwitch(switchTo)}
          className="p-0 h-auto text-sm text-blue-600 hover:text-blue-700 underline"
        >
          {action}
        </Button>
      </div>

      {/* Additional Links */}
      {additionalLinks.length > 0 && (
        <div className="text-center space-y-2">
          {additionalLinks.map((link, index) => (
            <div key={index}>
              <Button
                variant="link"
                onClick={() => onFormSwitch(link.action)}
                className="p-0 h-auto text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline"
              >
                {link.text}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="text-center pt-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Potrzebujesz pomocy?{' '}
          <a 
            href="/support" 
            className="text-blue-600 hover:text-blue-700 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Skontaktuj się z nami
          </a>
        </p>
      </div>
    </div>
  );
};
