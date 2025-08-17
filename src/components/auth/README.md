# Authentication Components

Ten katalog zawiera komponenty do obsługi uwierzytelniania użytkowników w aplikacji HealthyMeal. Komponenty obsługują logowanie, rejestrację, resetowanie hasła i OAuth przez Google.

## Struktura komponentów

```
AuthLayout
├── AuthContainer
│   ├── AuthHeader
│   ├── AuthForm (LoginForm/RegisterForm/ResetPasswordForm)
│   ├── OAuthButtons
│   └── AuthFooter
└── ErrorBoundary
```

## Komponenty

### AuthLayout

Główny komponent łączący wszystkie części systemu uwierzytelniania.

**Props:**
- `formType: AuthFormType` - typ formularza ('login' | 'register' | 'reset-password')
- `onFormSwitch: (type: AuthFormType) => void` - callback do przełączania formularzy
- `defaultEmail?: string` - opcjonalny domyślny email (np. z URL params)

**Użycie:**
```tsx
<AuthLayout 
  formType="login"
  onFormSwitch={(type) => handleFormSwitch(type)}
  defaultEmail="user@example.com"
/>
```

### AuthContainer

Responsywny kontener formularza z gradientem i backdrop-blur.

**Props:**
- `children: React.ReactNode` - zawartość kontenera
- `className?: string` - dodatkowe klasy CSS
- `maxWidth?: string` - maksymalna szerokość (domyślnie "max-w-md")

**Użycie:**
```tsx
<AuthContainer maxWidth="max-w-lg">
  <YourAuthContent />
</AuthContainer>
```

### AuthHeader

Dynamiczny nagłówek z tytułem i opisem dla każdego typu formularza.

**Props:**
- `formType: AuthFormType` - typ formularza
- `title?: string` - opcjonalny niestandardowy tytuł
- `description?: string` - opcjonalny niestandardowy opis

**Użycie:**
```tsx
<AuthHeader formType="login" />
```

### LoginForm

Formularz logowania z polami email, hasło i checkbox "remember me".

**Props:**
- `onSubmit: (data: LoginFormData) => void` - callback po submit
- `isLoading: boolean` - stan ładowania
- `defaultEmail?: string` - opcjonalny domyślny email

**Użycie:**
```tsx
<LoginForm 
  onSubmit={handleLogin}
  isLoading={isLoading}
  defaultEmail="user@example.com"
/>
```

### RegisterForm

Formularz rejestracji z walidacją hasła, wskaźnikiem siły i terms checkbox.

**Props:**
- `onSubmit: (data: RegisterFormData) => void` - callback po submit
- `isLoading: boolean` - stan ładowania

**Użycie:**
```tsx
<RegisterForm 
  onSubmit={handleRegister}
  isLoading={isLoading}
/>
```

### ResetPasswordForm

Formularz resetowania hasła z polem email.

**Props:**
- `onSubmit: (data: ResetPasswordFormData) => void` - callback po submit
- `isLoading: boolean` - stan ładowania

**Użycie:**
```tsx
<ResetPasswordForm 
  onSubmit={handleResetPassword}
  isLoading={isLoading}
/>
```

### OAuthButtons

Przyciski logowania przez zewnętrzne serwisy (Google).

**Props:**
- `onGoogleLogin: () => void` - callback po kliknięciu Google
- `isLoading: boolean` - stan ładowania
- `className?: string` - dodatkowe klasy CSS

**Użycie:**
```tsx
<OAuthButtons 
  onGoogleLogin={handleGoogleLogin}
  isLoading={isLoading}
/>
```

### AuthFooter

Stopka z linkami do przełączania między formularzami.

**Props:**
- `formType: AuthFormType` - aktualny typ formularza
- `onFormSwitch: (type: AuthFormType) => void` - callback do przełączania

**Użycie:**
```tsx
<AuthFooter 
  formType="login"
  onFormSwitch={handleFormSwitch}
/>
```

### ErrorBoundary

Obsługa błędów na poziomie komponentów z możliwością ponowienia.

**Props:**
- `children: React.ReactNode` - komponenty do obsługi
- `fallback?: ReactNode` - opcjonalny niestandardowy fallback

**Użycie:**
```tsx
<ErrorBoundary>
  <AuthLayout formType="login" onFormSwitch={handleSwitch} />
</ErrorBoundary>
```

## Hooks

### useAuthForm

Custom hook do zarządzania stanem formularza uwierzytelniania.

**Parametry:**
- `formType: AuthFormType` - typ formularza

**Zwraca:**
- `formData` - dane formularza
- `errors` - błędy walidacji
- `isLoading` - stan ładowania
- `updateField` - funkcja aktualizacji pola
- `handleSubmit` - funkcja submit
- `resetForm` - funkcja resetowania
- `setDefaultEmail` - funkcja ustawienia domyślnego emaila
- `validateField` - funkcja walidacji pola
- `validateForm` - funkcja walidacji całego formularza

**Użycie:**
```tsx
const { formData, errors, updateField, handleSubmit } = useAuthForm('login');
```

### useToast

Custom hook do wyświetlania toast notifications.

**Zwraca:**
- `toast` - funkcja generyczna
- `success` - funkcja dla sukcesu
- `error` - funkcja dla błędów
- `info` - funkcja dla informacji

**Użycie:**
```tsx
const { success, error } = useToast();

success('Konto zostało utworzone!');
error('Wystąpił błąd logowania');
```

## Typy

### AuthFormType
```typescript
type AuthFormType = 'login' | 'register' | 'reset-password';
```

### AuthFormData
```typescript
interface AuthFormData {
  email: string;
  password?: string;
  confirmPassword?: string;
  rememberMe?: boolean;
  acceptTerms?: boolean;
}
```

### LoginFormData
```typescript
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}
```

### RegisterFormData
```typescript
interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}
```

### ResetPasswordFormData
```typescript
interface ResetPasswordFormData {
  email: string;
}
```

### ValidationErrors
```typescript
interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  general?: string;
}
```

## Walidacja

### Email
- Wymagany
- Poprawny format emaila

### Hasło
- Minimum 8 znaków
- Dla rejestracji: wielka litera, mała litera, cyfra

### Potwierdzenie hasła (rejestracja)
- Identyczne z hasłem

### Terms (rejestracja)
- Musi być zaakceptowane

## Integracja z API

Komponenty integrują się z `AuthService` dla operacji uwierzytelniania:

- **Rejestracja**: `AuthService.signUp()`
- **Logowanie**: `AuthService.signIn()`
- **Google OAuth**: `AuthService.signInWithGoogle()`
- **Reset hasła**: `AuthService.resetPassword()`

## Stylowanie

Komponenty używają:
- **Tailwind CSS** z dark mode
- **Shadcn/ui** komponenty
- Responsywny design
- Gradient tła z backdrop-blur
- Spójne kolory i spacing

## Routing

Strony uwierzytelniania:
- `/login` - logowanie
- `/register` - rejestracja
- `/reset-password` - resetowanie hasła

## Middleware

Middleware autoryzacji:
- Ochrona chronionych stron
- Redirect zalogowanych użytkowników z auth stron
- Przechowywanie stanu auth w `locals`

## Testowanie

Testy jednostkowe dla:
- Komponentów React
- Custom hooks
- Walidacji formularzy
- Interakcji użytkownika

## Przykład użycia

```tsx
import { AuthLayout } from '@/components/auth';

function LoginPage() {
  const handleFormSwitch = (type: AuthFormType) => {
    // Przekierowanie do odpowiedniej strony
    window.location.href = `/${type}`;
  };

  return (
    <AuthLayout 
      formType="login"
      onFormSwitch={handleFormSwitch}
      defaultEmail={getEmailFromUrl()}
    />
  );
}
```

## Wymagania

- React 19+
- TypeScript 5+
- Tailwind CSS 4
- Shadcn/ui komponenty
- Supabase Auth
- Astro 5
