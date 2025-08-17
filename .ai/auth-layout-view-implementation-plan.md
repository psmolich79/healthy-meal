# Plan implementacji widoku Uwierzytelnianie (AuthLayout)

## 1. Przegląd
Widok uwierzytelniania to zestaw ekranów umożliwiających użytkownikom rejestrację, logowanie i resetowanie hasła w aplikacji HealthyMeal. Widok obsługuje zarówno tradycyjne uwierzytelnianie email/hasło, jak i logowanie przez Google OAuth 2.0. Zapewnia bezpieczne i intuicyjne doświadczenie użytkownika z walidacją w czasie rzeczywistym.

## 2. Routing widoku
- **Logowanie**: `/login`
- **Rejestracja**: `/register`
- **Reset hasła**: `/reset-password`
- **Metoda routingu**: Astro static routing z React components

## 3. Struktura komponentów
```
AuthLayout
├── AuthContainer
│   ├── AuthHeader
│   ├── AuthForm
│   │   ├── LoginForm
│   │   ├── RegisterForm
│   │   └── ResetPasswordForm
│   ├── OAuthButtons
│   └── AuthFooter
└── ErrorBoundary
```

## 4. Szczegóły komponentów

### AuthLayout
- **Opis komponentu**: Główny layout dla wszystkich ekranów uwierzytelniania, zapewnia spójny wygląd i obsługuje routing między formularzami
- **Główne elementy**: Container div z flexbox layout, background image/pattern, logo aplikacji
- **Komponenty Shadcn/ui**: `Card`, `CardContent`
- **Obsługiwane interakcje**: Przełączanie między formularzami, obsługa błędów globalnych
- **Obsługiwana walidacja**: Sprawdzenie czy użytkownik nie jest już zalogowany
- **Typy**: `AuthLayoutProps`, `AuthFormType`
- **Propsy**: `formType: 'login' | 'register' | 'reset-password'`, `onFormSwitch: (type: AuthFormType) => void`

### AuthContainer
- **Opis komponentu**: Kontener formularza uwierzytelniania z responsywnym designem
- **Główne elementy**: Card container, padding, shadow, border radius
- **Komponenty Shadcn/ui**: `Card`, `CardContent`
- **Obsługiwane interakcje**: Responsive behavior, focus management
- **Obsługiwana walidacja**: Sprawdzenie szerokości ekranu dla mobile/desktop
- **Typy**: `AuthContainerProps`
- **Propsy**: `children: React.ReactNode`, `className?: string`, `maxWidth?: string`

### AuthHeader
- **Opis komponentu**: Nagłówek formularza z tytułem i opisem
- **Główne elementy**: H1 title, description text, logo (opcjonalnie)
- **Komponenty Shadcn/ui**: `CardHeader`
- **Obsługiwane interakcje**: Wyświetlanie odpowiedniego tytułu dla każdego typu formularza
- **Obsługiwana walidacja**: Sprawdzenie typu formularza
- **Typy**: `AuthHeaderProps`
- **Propsy**: `formType: AuthFormType`, `title?: string`, `description?: string`

### AuthForm
- **Opis komponentu**: Kontener formularza z walidacją i obsługą submit
- **Główne elementy**: Form element, validation errors, submit button
- **Komponenty Shadcn/ui**: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- **Obsługiwane interakcje**: Submit formularza, walidacja real-time, obsługa błędów
- **Obsługiwana walidacja**: 
  - Wszystkie pola wymagane są wypełnione
  - Email ma poprawny format
  - Hasło spełnia wymagania bezpieczeństwa
  - Potwierdzenie hasła jest zgodne
- **Typy**: `AuthFormProps`, `AuthFormData`, `ValidationErrors`
- **Propsy**: `onSubmit: (data: AuthFormData) => void`, `isLoading: boolean`, `errors: ValidationErrors`

### LoginForm
- **Opis komponentu**: Formularz logowania z polami email i hasło
- **Główne elementy**: Email input, password input, remember me checkbox, submit button
- **Komponenty Shadcn/ui**: `Input`, `Label`, `Checkbox`, `Button`, `FormMessage`
- **Obsługiwane interakcje**: Wpisywanie danych, toggle remember me, submit
- **Obsługiwana walidacja**:
  - Email nie może być pusty
  - Email musi mieć poprawny format
  - Hasło nie może być puste
  - Minimum 8 znaków dla hasła
- **Typy**: `LoginFormProps`, `LoginFormData`
- **Propsy**: `onSubmit: (data: LoginFormData) => void`, `isLoading: boolean`, `defaultEmail?: string`

### RegisterForm
- **Opis komponentu**: Formularz rejestracji z polami email, hasło i potwierdzenie hasła
- **Główne elementy**: Email input, password input, confirm password input, terms checkbox, submit button
- **Komponenty Shadcn/ui**: `Input`, `Label`, `Checkbox`, `Button`, `FormMessage`
- **Obsługiwane interakcje**: Wpisywanie danych, toggle terms, submit
- **Obsługiwana walidacja**:
  - Email nie może być pusty i musi mieć poprawny format
  - Hasło minimum 8 znaków
  - Hasło musi zawierać wielką literę, małą literę i cyfrę
  - Potwierdzenie hasła musi być identyczne
  - Terms checkbox musi być zaznaczony
- **Typy**: `RegisterFormProps`, `RegisterFormData`
- **Propsy**: `onSubmit: (data: RegisterFormData) => void`, `isLoading: boolean`

### ResetPasswordForm
- **Opis komponentu**: Formularz resetowania hasła z polem email
- **Główne elementy**: Email input, submit button, info text
- **Komponenty Shadcn/ui**: `Input`, `Label`, `Button`, `FormMessage`
- **Obsługiwane interakcje**: Wpisywanie emaila, submit
- **Obsługiwana walidacja**:
  - Email nie może być pusty
  - Email musi mieć poprawny format
- **Typy**: `ResetPasswordFormProps`, `ResetPasswordFormData`
- **Propsy**: `onSubmit: (data: ResetPasswordFormData) => void`, `isLoading: boolean`

### OAuthButtons
- **Opis komponentu**: Przyciski logowania przez zewnętrzne serwisy (Google)
- **Główne elementy**: Google OAuth button, separator, styling
- **Komponenty Shadcn/ui**: `Button`, `Separator`
- **Obsługiwane interakcje**: Kliknięcie w Google button, inicjacja OAuth flow
- **Obsługiwana walidacja**: Sprawdzenie czy OAuth jest dostępny
- **Typy**: `OAuthButtonsProps`
- **Propsy**: `onGoogleLogin: () => void`, `isLoading: boolean`, `className?: string`

### AuthFooter
- **Opis komponentu**: Stopka formularza z linkami do innych ekranów uwierzytelniania
- **Główne elementy**: Links container, navigation links, separator
- **Komponenty Shadcn/ui**: `Separator`, `Button` (variant="link")
- **Obsługiwane interakcje**: Przełączanie między formularzami, linki pomocnicze
- **Obsługiwana walidacja**: Sprawdzenie aktualnego typu formularza
- **Typy**: `AuthFooterProps`
- **Propsy**: `formType: AuthFormType`, `onFormSwitch: (type: AuthFormType) => void`

## 5. Komponenty Shadcn/ui

### Komponenty formularzy
- **Form**: Główny kontener formularza z walidacją React Hook Form + Zod
- **FormField**: Pole formularza z walidacją
- **FormItem**: Kontener elementu formularza
- **FormLabel**: Etykieta pola formularza
- **FormControl**: Kontrolka formularza (Input, Checkbox)
- **FormMessage**: Komunikat błędu/walidacji

### Komponenty layoutu
- **Card**: Główny kontener formularza uwierzytelniania
- **CardHeader**: Nagłówek formularza
- **CardContent**: Zawartość formularza

### Komponenty interaktywne
- **Button**: Przyciski submit i OAuth
- **Input**: Pola tekstowe (email, hasło)
- **Label**: Etykiety pól
- **Checkbox**: Checkboxy (remember me, terms)
- **Separator**: Separatory między sekcjami

### Komponenty pomocnicze
- **FormMessage**: Komunikaty błędów walidacji
- **FormDescription**: Opisy pól formularza

## 6. Typy

### Typy komponentów
```typescript
type AuthFormType = 'login' | 'register' | 'reset-password';

interface AuthLayoutProps {
  formType: AuthFormType;
  onFormSwitch: (type: AuthFormType) => void;
}

interface AuthContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

interface AuthHeaderProps {
  formType: AuthFormType;
  title?: string;
  description?: string;
}

interface AuthFormProps {
  onSubmit: (data: AuthFormData) => void;
  isLoading: boolean;
  errors: ValidationErrors;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
  defaultEmail?: string;
}

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  isLoading: boolean;
}

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => void;
  isLoading: boolean;
}

interface OAuthButtonsProps {
  onGoogleLogin: () => void;
  isLoading: boolean;
  className?: string;
}

interface AuthFooterProps {
  formType: AuthFormType;
  onFormSwitch: (type: AuthFormType) => void;
}
```

### Typy danych formularzy
```typescript
interface AuthFormData {
  email: string;
  password?: string;
  confirmPassword?: string;
  rememberMe?: boolean;
  acceptTerms?: boolean;
}

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface ResetPasswordFormData {
  email: string;
}
```

### Typy walidacji
```typescript
interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  general?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

interface FieldValidation {
  value: string;
  isValid: boolean;
  error: string | null;
}
```

## 6. Zarządzanie stanem

### Stan lokalny komponentów
- `formData` - dane formularza
- `errors` - błędy walidacji
- `isLoading` - stan ładowania
- `isValid` - stan walidacji formularza

### Custom Hook: useAuthForm
```typescript
const useAuthForm = (formType: AuthFormType) => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    acceptTerms: false
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = useCallback((field: keyof AuthFormData, value: string): string | null => {
    // Logika walidacji dla poszczególnych pól
  }, []);

  const validateForm = useCallback((): ValidationResult => {
    // Logika walidacji całego formularza
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    // Logika submit
  }, [formData, validateForm]);

  return {
    formData,
    errors,
    isLoading,
    setFormData,
    validateField,
    handleSubmit
  };
};
```

### Stan globalny (Context)
- `authState` - stan uwierzytelnienia użytkownika
- `userProfile` - profil zalogowanego użytkownika

## 7. Integracja API

### Endpoint: Supabase Auth
- **Rejestracja**: `supabase.auth.signUp()`
- **Logowanie**: `supabase.auth.signInWithPassword()`
- **Google OAuth**: `supabase.auth.signInWithOAuth()`
- **Reset hasła**: `supabase.auth.resetPasswordForEmail()`

### Implementacja wywołań API
```typescript
// Rejestracja
const handleRegister = async (data: RegisterFormData) => {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password
  });
  
  if (error) throw error;
  return authData;
};

// Logowanie
const handleLogin = async (data: LoginFormData) => {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  });
  
  if (error) throw error;
  return authData;
};

// Google OAuth
const handleGoogleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/profile`
    }
  });
  
  if (error) throw error;
  return data;
};
```

### Obsługa odpowiedzi
- **Sukces**: Przekierowanie do odpowiedniego ekranu
- **Błąd walidacji**: Wyświetlenie błędów w formularzu
- **Błąd autoryzacji**: Wyświetlenie komunikatu o błędzie
- **Błąd sieci**: Komunikat o problemie z połączeniem

## 8. Interakcje użytkownika

### Rejestracja nowego konta
1. Użytkownik wypełnia formularz rejestracji
2. Walidacja real-time sprawdza poprawność danych
3. Po kliknięciu "Zarejestruj" formularz jest walidowany
4. Jeśli walidacja przejdzie, konto jest tworzone
5. Użytkownik jest przekierowany do ekranu preferencji

### Logowanie do aplikacji
1. Użytkownik wprowadza email i hasło
2. Walidacja sprawdza poprawność formatu
3. Po kliknięciu "Zaloguj" dane są weryfikowane
4. Jeśli dane są poprawne, użytkownik jest logowany
5. Przekierowanie do głównego ekranu aplikacji

### Logowanie przez Google
1. Użytkownik klika "Kontynuuj z Google"
2. Otwiera się okno OAuth Google
3. Po autoryzacji użytkownik jest logowany
4. Jeśli to pierwsze logowanie, tworzony jest profil
5. Przekierowanie do odpowiedniego ekranu

### Resetowanie hasła
1. Użytkownik wprowadza swój email
2. Walidacja sprawdza format emaila
3. Po kliknięciu "Resetuj hasło" link jest wysyłany
4. Potwierdzenie wysłania linku
5. Użytkownik sprawdza email i resetuje hasło

## 9. Warunki i walidacja

### Warunki wymagane przez API
- **Email**: Poprawny format emaila
- **Hasło**: Minimum 8 znaków
- **Potwierdzenie hasła**: Identyczne z hasłem
- **Terms**: Zaakceptowane warunki użytkowania

### Walidacja na poziomie komponentów
- **LoginForm**: 
  - Email niepusty i poprawny format
  - Hasło niepuste i minimum 8 znaków
- **RegisterForm**: 
  - Email niepusty i poprawny format
  - Hasło spełnia wymagania bezpieczeństwa
  - Potwierdzenie hasła jest identyczne
  - Terms zaakceptowane
- **ResetPasswordForm**: 
  - Email niepusty i poprawny format

### Wpływ na stan interfejsu
- **Błędy walidacji**: Wyświetlenie komunikatów błędów, dezaktywacja przycisku submit
- **Stan ładowania**: Wyświetlenie spinnera, dezaktywacja formularza
- **Sukces**: Przekierowanie do odpowiedniego ekranu
- **Błąd API**: Wyświetlenie komunikatu o błędzie

## 10. Obsługa błędów

### Typy błędów
1. **Błędy walidacji**: Nieprawidłowe dane wejściowe
2. **Błędy autoryzacji**: Nieprawidłowe dane logowania
3. **Błędy rejestracji**: Email już istnieje
4. **Błędy OAuth**: Problem z Google autoryzacją
5. **Błędy sieci**: Problemy z połączeniem

### Strategie obsługi błędów
- **Inline errors**: Błędy wyświetlane przy polach formularza
- **Toast notifications**: Krótkie komunikaty o błędach
- **Error boundaries**: Obsługa nieoczekiwanych błędów
- **Retry logic**: Automatyczne ponowienie dla błędów sieci

### Komunikaty błędów
- **Walidacja email**: "Wprowadź poprawny adres email"
- **Walidacja hasła**: "Hasło musi mieć minimum 8 znaków"
- **Potwierdzenie hasła**: "Hasła nie są identyczne"
- **Email istnieje**: "Ten adres email jest już zarejestrowany"
- **Nieprawidłowe dane**: "Nieprawidłowy email lub hasło"
- **Błąd OAuth**: "Problem z logowaniem przez Google"

## 11. Kroki implementacji

### 1. Przygotowanie struktury plików
```
src/
├── pages/
│   ├── login.astro
│   ├── register.astro
│   └── reset-password.astro
├── components/
│   └── auth/
│       ├── AuthLayout.tsx
│       ├── AuthContainer.tsx
│       ├── AuthHeader.tsx
│       ├── AuthForm.tsx
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       ├── ResetPasswordForm.tsx
│       ├── OAuthButtons.tsx
│       └── AuthFooter.tsx
└── hooks/
    └── useAuthForm.ts
```

### 2. Implementacja typów i interfejsów
- Stworzenie wszystkich typów komponentów
- Definicja typów danych formularzy
- Implementacja typów walidacji

### 3. Implementacja custom hooka
- Stworzenie `useAuthForm`
- Implementacja logiki walidacji
- Obsługa stanu formularza

### 4. Implementacja komponentów UI
- Stworzenie podstawowych komponentów
- Implementacja logiki walidacji
- Dodanie obsługi zdarzeń

### 5. Integracja z Supabase Auth
- Implementacja wywołań API
- Obsługa odpowiedzi i błędów
- Konfiguracja OAuth

### 6. Implementacja walidacji
- Walidacja real-time w polach
- Walidacja formularza przed wysłaniem
- Obsługa błędów walidacji

### 7. Implementacja OAuth
- Konfiguracja Google OAuth
- Obsługa callback'ów
- Integracja z routingiem

### 8. Implementacja obsługi błędów
- Error boundaries
- Toast notifications
- Inline error messages

### 9. Implementacja routing
- Stworzenie plików .astro
- Integracja z layoutem aplikacji
- Dodanie meta tagów i SEO

### 10. Testowanie i optymalizacja
- Testy jednostkowe komponentów
- Testy integracyjne
- Optymalizacja wydajności
- Responsive design

### 11. Integracja z aplikacją
- Połączenie z globalnym stanem
- Integracja z middleware
- Dodanie redirectów

### 12. Finalizacja
- Code review
- Dokumentacja komponentów
- Testy end-to-end
- Deployment
