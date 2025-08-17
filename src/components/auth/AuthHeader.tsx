import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { AuthFormType } from '@/types';

interface AuthHeaderProps {
  formType: AuthFormType;
  title?: string;
  description?: string;
}

/**
 * Header component for authentication forms.
 * Displays appropriate title and description based on form type.
 */
export const AuthHeader: React.FC<AuthHeaderProps> = ({ 
  formType, 
  title, 
  description 
}) => {
  const getDefaultContent = () => {
    switch (formType) {
      case 'login':
        return {
          title: 'Witaj ponownie',
          description: 'Zaloguj się do swojego konta, aby kontynuować'
        };
      case 'register':
        return {
          title: 'Utwórz konto',
          description: 'Zarejestruj się, aby rozpocząć korzystanie z aplikacji'
        };
      case 'reset-password':
        return {
          title: 'Resetuj hasło',
          description: 'Wprowadź swój email, aby otrzymać link do resetowania hasła'
        };
      default:
        return {
          title: 'Uwierzytelnianie',
          description: 'Zaloguj się lub zarejestruj'
        };
    }
  };

  const { title: defaultTitle, description: defaultDescription } = getDefaultContent();

  return (
    <CardHeader className="text-center pb-6">
      <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        {title || defaultTitle}
      </CardTitle>
      <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
        {description || defaultDescription}
      </CardDescription>
    </CardHeader>
  );
};
