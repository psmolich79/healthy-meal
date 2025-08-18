# Komponenty UI - Shadcn/ui + Custom

Ten katalog zawiera komponenty UI używane w całej aplikacji HealthyMeal. Większość komponentów pochodzi z biblioteki Shadcn/ui, ale zawiera również custom komponenty specyficzne dla aplikacji.

## Struktura Komponentów

```
ui/
├── Shadcn/ui Components     # Komponenty z biblioteki Shadcn/ui
│   ├── accordion.tsx       # Akordeon
│   ├── alert-dialog.tsx    # Alert dialog
│   ├── alert.tsx           # Alert
│   ├── avatar.tsx          # Avatar
│   ├── badge.tsx           # Badge
│   ├── button.tsx          # Przycisk
│   ├── calendar.tsx        # Kalendarz
│   ├── card.tsx            # Karta
│   ├── carousel.tsx        # Karuzela
│   ├── checkbox.tsx        # Checkbox
│   ├── dropdown-menu.tsx   # Menu rozwijane
│   ├── form.tsx            # Formularz
│   ├── input.tsx           # Pole tekstowe
│   ├── label.tsx           # Etykieta
│   ├── pagination.tsx      # Paginacja
│   ├── popover.tsx         # Popover
│   ├── progress.tsx        # Pasek postępu
│   ├── scroll-area.tsx     # Obszar przewijania
│   ├── select.tsx          # Select
│   ├── separator.tsx       # Separator
│   ├── table.tsx           # Tabela
│   ├── tabs.tsx            # Zakładki
│   └── toast.tsx           # Toast notifications
├── Custom Components        # Custom komponenty aplikacji
│   ├── ErrorBoundary.tsx   # Obsługa błędów React
│   ├── LazyLoader.tsx      # Lazy loading komponentów
│   ├── LoadingSpinner.tsx  # Wskaźnik ładowania
│   ├── SearchInput.tsx     # Pole wyszukiwania
│   └── ToastWrapper.tsx    # Opakowanie toast notifications
└── index.ts                # Eksport wszystkich komponentów
```

## Shadcn/ui Komponenty

### accordion.tsx
Komponent akordeonu do organizowania treści w zwijane sekcje.

**Użycie:**
```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
  </AccordionItem>
</Accordion>
```

### alert-dialog.tsx
Modal dialog do wyświetlania ważnych informacji wymagających potwierdzenia.

**Użycie:**
```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger>Open</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### alert.tsx
Komponent alertu do wyświetlania informacji, ostrzeżeń i błędów.

**Warianty:**
- `default` - neutralny alert
- `destructive` - alert błędu/ostrzeżenia

**Użycie:**
```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>You can add components to your app using the cli.</AlertDescription>
</Alert>
```

### avatar.tsx
Komponent avataru do wyświetlania zdjęć profilowych użytkowników.

**Użycie:**
```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

<Avatar>
  <AvatarImage src="/avatars/01.png" alt="@username" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
```

### badge.tsx
Komponent badge do wyświetlania statusów, tagów i etykiet.

**Warianty:**
- `default` - domyślny
- `secondary` - drugorzędny
- `destructive` - destrukcyjny
- `outline` - z obramowaniem

**Użycie:**
```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="secondary">Secondary</Badge>
```

### button.tsx
Komponent przycisku z różnymi wariantami i rozmiarami.

**Warianty:**
- `default` - domyślny
- `destructive` - destrukcyjny
- `outline` - z obramowaniem
- `secondary` - drugorzędny
- `ghost` - przezroczysty
- `link` - jako link

**Rozmiary:**
- `default` - domyślny
- `sm` - mały
- `lg` - duży
- `icon` - ikona

**Użycie:**
```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg">
  Click me
</Button>
```

### card.tsx
Komponent karty do organizowania treści w bloki.

**Użycie:**
```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>
```

### form.tsx
Komponenty formularza z walidacją React Hook Form + Zod.

**Użycie:**
```tsx
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input placeholder="shadcn" {...field} />
          </FormControl>
          <FormDescription>This is your public display name.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### input.tsx
Komponent pola tekstowego z różnymi typami.

**Użycie:**
```tsx
import { Input } from "@/components/ui/input";

<Input type="email" placeholder="Email" />
```

### select.tsx
Komponent select do wyboru opcji z listy.

**Użycie:**
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="blueberry">Blueberry</SelectItem>
  </SelectContent>
</Select>
```

### toast.tsx
System powiadomień toast.

**Użycie:**
```tsx
import { useToast } from "@/components/ui/use-toast";

const { toast } = useToast();

toast({
  title: "Scheduled: Catch up",
  description: "Friday, February 10, 2023 at 3:00 PM",
});
```

## Custom Komponenty

### ErrorBoundary.tsx
Komponent do obsługi błędów JavaScript w komponentach React.

**Props:**
- `children: ReactNode` - komponenty do obsługi
- `fallback?: ReactNode` - niestandardowy UI błędu

**Użycie:**
```tsx
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### LazyLoader.tsx
Komponent do lazy loadingu komponentów z Suspense.

**Props:**
- `children: ReactNode` - komponenty do załadowania
- `fallback?: ReactNode` - fallback podczas ładowania

**Użycie:**
```tsx
import { LazyLoader } from "@/components/ui/LazyLoader";

<LazyLoader fallback={<LoadingSpinner />}>
  <LazyComponent />
</LazyLoader>
```

### LoadingSpinner.tsx
Wskaźnik ładowania z różnymi rozmiarami i statusami.

**Props:**
- `isVisible: boolean` - czy spinner jest widoczny
- `status?: string` - tekst statusu
- `progress?: number` - postęp (0-100)
- `size?: 'sm' | 'md' | 'lg'` - rozmiar spinnera
- `className?: string` - dodatkowe klasy CSS

**Użycie:**
```tsx
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

<LoadingSpinner isVisible={true} status="Loading..." size="lg" />
```

### SearchInput.tsx
Pole wyszukiwania z walidacją i obsługą klawisza Enter.

**Props:**
- `value: string` - aktualna wartość
- `onChange: (value: string) => void` - callback zmiany
- `onSubmit: () => void` - callback wysłania
- `placeholder?: string` - placeholder
- `disabled?: boolean` - czy pole jest wyłączone
- `maxLength?: number` - maksymalna długość
- `label?: string` - etykieta pola
- `helpText?: string` - tekst pomocniczy

**Użycie:**
```tsx
import { SearchInput } from "@/components/ui/SearchInput";

<SearchInput
  value={query}
  onChange={setQuery}
  onSubmit={handleSearch}
  placeholder="Search recipes..."
  maxLength={500}
  label="Search"
  helpText="Enter your search query"
/>
```

### ToastWrapper.tsx
Opakowanie toast notifications z konfiguracją.

**Użycie:**
```tsx
import { ToastWrapper } from "@/components/ui/ToastWrapper";

<ToastWrapper />
```

## Stylowanie

### Tailwind CSS
Wszystkie komponenty używają Tailwind CSS z:
- Responsywnymi breakpointami
- Dark mode support
- Custom color palette
- Consistent spacing scale

### CSS Variables
Komponenty używają CSS variables dla:
- Kolory motywu
- Typografię
- Spacing
- Border radius
- Shadows

### Variants
Komponenty implementują system wariantów z:
- `class-variance-authority` (CVA)
- Spójne API wariantów
- Type-safe props

## Accessibility

### ARIA Support
Wszystkie komponenty implementują:
- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

### WCAG Compliance
Komponenty spełniają standardy:
- WCAG 2.1 AA
- Proper contrast ratios
- Semantic HTML
- Focus indicators

## Performance

### Optimization
Komponenty są zoptymalizowane pod kątem:
- Bundle size
- Runtime performance
- Tree shaking
- Code splitting

### Best Practices
- React.memo dla komponentów
- useCallback dla funkcji
- useMemo dla obliczeń
- Lazy loading

## Testowanie

### Test Files
- `LoadingSpinner.test.tsx` - testy LoadingSpinner
- `SearchInput.test.tsx` - testy SearchInput

### Testing Utilities
- React Testing Library
- Vitest
- Custom test helpers

## Instalacja

### Shadcn/ui
```bash
npx shadcn@latest add [component-name]
```

### Custom Components
Custom komponenty są dostępne bezpośrednio z `@/components/ui`.

## Zależności

### Core
- React 19
- TypeScript 5
- Tailwind CSS 4

### UI Libraries
- Radix UI (primitive components)
- class-variance-authority
- clsx
- tailwind-merge

### Icons
- Lucide React
- Heroicons

## Wymagania

- Node.js 18+
- React 19+
- Tailwind CSS 4
- TypeScript 5

## Wsparcie

W przypadku problemów z komponentami:
1. Sprawdź dokumentację Shadcn/ui
2. Sprawdź testy jednostkowe
3. Sprawdź implementację komponentu
4. Otwórz issue w repozytorium
