# Healthy Meal - AI-Powered Recipe Management

A modern web application for generating, managing, and organizing AI-powered recipes based on user preferences and dietary requirements.

## 🚀 Features

- **AI Recipe Generation**: Generate personalized recipes using advanced AI models (GPT-4, GPT-4o, GPT-3.5 Turbo)
- **User Preferences**: Store and apply dietary preferences, cuisine choices, and **allergy restrictions** to recipe generation
- **Recipe Management**: Create, view, update visibility, rate, and regenerate recipes
- **Smart Pagination**: Efficient recipe browsing with filtering and sorting
- **Rate Limiting**: Intelligent rate limiting for AI generation (10 per hour per user)
- **Cost Tracking**: Monitor AI usage costs and token consumption with detailed analytics
- **Secure API**: JWT-based authentication with Row-Level Security (RLS)
- **Allergy Safety**: **Critical safety features** to prevent allergens in generated recipes
- **User Profiles**: Comprehensive profile management with preferences and API keys
- **Recipe Ratings**: Like/dislike system for recipe feedback

## 🛠️ Tech Stack

- **Frontend**: Astro 5 + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 + Shadcn/ui
- **Backend**: Astro Server Endpoints + Supabase
- **Database**: PostgreSQL with RLS policies
- **Authentication**: Supabase Auth with JWT
- **AI Integration**: OpenAI GPT models (configurable per user)
- **Testing**: Vitest + Testing Library + Playwright E2E
- **Validation**: Zod schemas
- **Charts**: Recharts for analytics visualization

## 📁 Project Structure

```
healthy-meal/
├── src/
│   ├── components/          # UI components (Astro + React)
│   │   ├── ai-usage/       # AI usage analytics components
│   │   ├── auth/           # Authentication components
│   │   ├── profile/        # User profile management
│   │   ├── recipes/        # Recipe generation and management
│   │   ├── ui/             # Reusable UI components (Shadcn/ui)
│   │   ├── Navigation.astro # Main navigation
│   │   └── UserMenu.tsx    # User menu component
│   ├── data/               # Static data (preferences, etc.)
│   ├── db/                 # Supabase client and types
│   ├── hooks/              # Custom React hooks
│   ├── lib/
│   │   ├── config/         # Configuration files
│   │   ├── services/       # Business logic services
│   │   ├── schemas/        # Zod validation schemas
│   │   └── utils/          # Utility functions
│   ├── middleware/         # Authentication and security middleware
│   ├── pages/
│   │   ├── api/            # REST API endpoints
│   │   │   ├── ai/         # AI usage analytics
│   │   │   ├── auth/       # Authentication endpoints
│   │   │   ├── profiles/   # Profile management
│   │   │   └── recipes/    # Recipe management
│   │   ├── ai-usage.astro  # AI usage analytics page
│   │   ├── profile.astro   # User profile page
│   │   ├── recipes/        # Recipe pages
│   │   └── auth/           # Authentication pages
│   ├── styles/             # Global CSS
│   ├── test/               # Unit tests
│   └── utils/              # Utility functions
├── supabase/               # Database migrations and config
├── tests/                  # E2E and accessibility tests
├── docs/                   # API and feature documentation
└── .ai/                    # Implementation plans
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### 1. Clone and Install

```bash
git clone <repository-url>
cd healthy-meal
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. Database Setup

Run the database migrations:

```bash
npx supabase db push
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:4321`

## 📚 API Endpoints

### Authentication Required

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Recipe Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/recipes/generate` | Generate new AI recipe |
| `GET` | `/api/recipes/{id}` | Get recipe details |
| `PUT` | `/api/recipes/{id}/visibility` | Update recipe visibility |
| `POST` | `/api/recipes/{id}/regenerate` | Regenerate recipe |
| `POST` | `/api/recipes/{id}/rating` | Rate recipe (like/dislike) |
| `POST` | `/api/recipes/{id}/save` | Save recipe to favorites |
| `GET` | `/api/recipes` | List recipes with pagination |

### Profile Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profiles/me` | Get user profile |
| `PUT` | `/api/profiles/me` | Update preferences |
| `PUT` | `/api/profiles/api-key` | Update API key |
| `DELETE` | `/api/profiles/me` | Schedule deletion |

### AI Usage Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ai/usage` | Get AI usage statistics |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signin` | User sign in |
| `POST` | `/api/auth/signup` | User sign up |

## 🔧 Configuration

### AI Models

The application supports multiple AI models with different capabilities:

- **GPT-4o**: Most capable, best for complex recipes
- **GPT-4o-mini**: Fast and cost-effective
- **GPT-3.5 Turbo**: Fast and cost-effective

Users can configure their own API keys for personalized AI usage.

### Rate Limiting

- **Recipe Generation**: 10 per hour per user
- **Recipe Regeneration**: Same limit as generation
- **Other Operations**: No rate limiting

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode
npm run test:e2e:headed
```

### Accessibility Tests

```bash
# Run accessibility tests
npm run test:accessibility
```

### Type Checking

```bash
# Check TypeScript types
npm run type-check
```

## 📖 API Documentation

Complete API documentation is available in the `docs/` directory:

- [Recipe API Documentation](docs/api-recipes.md)
- [Profile API Documentation](docs/api-profiles.md)
- [AI Usage API Documentation](docs/api-ai-usage.md)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Row-Level Security (RLS)**: Database-level access control
- **Input Validation**: Zod schema validation for all inputs
- **Rate Limiting**: Protection against abuse
- **CORS Protection**: Configurable cross-origin policies
- **Security Headers**: Comprehensive security middleware

## 🚀 Deployment

### Build for Production

```bash
npm run build:prod
```

### Docker Support

```bash
# Build Docker image
npm run docker:build

# Run with Docker Compose
npm run docker:compose:up
```

### Performance and Security Audits

```bash
# Performance audit
npm run performance:audit

# Security audit
npm run security:audit
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Check the [documentation](docs/)
- Review the [implementation plans](.ai/)
- Open an issue on GitHub

## 🔮 Roadmap

- [x] AI recipe generation with allergy safety
- [x] User preference management
- [x] Recipe rating system
- [x] AI usage analytics
- [x] Comprehensive testing suite
- [ ] Real-time AI model integration
- [ ] Recipe sharing and social features
- [ ] Advanced filtering and search
- [ ] Meal planning and scheduling
- [ ] Nutritional information integration
- [ ] Mobile app development

---

## 🚀 Najnowsze Aktualizacje

### Poprawki w Obsłudze Alergenów (Grudzień 2024)

Zidentyfikowano i naprawiono krytyczny problem z generowaniem przepisów dla użytkowników z alergiami. **Wcześniej AI mogło generować przepisy zawierające składniki, na które użytkownik ma alergię**, co stanowiło zagrożenie dla zdrowia.

#### Co zostało naprawione:

✅ **Kategoryzacja preferencji** - Alergeny są teraz rozpoznawane i traktowane specjalnie  
✅ **Krytyczne ostrzeżenia** - AI otrzymuje jasne instrukcje o tym, że alergeny to kwestia zdrowia i bezpieczeństwa  
✅ **Lista kontrolna bezpieczeństwa** - Dodano 5-punktową weryfikację składników  
✅ **Przykłady unikania** - AI wie, jakich składników i ich pochodnych unikać  
✅ **Instrukcje ostrożności** - AI jest zachęcane do wybierania bezpieczniejszych alternatyw  

#### Przykład poprawki:

**Przed:** AI otrzymywało tylko listę preferencji bez specjalnego traktowania alergenów  
**Po:** AI otrzymuje jasne ostrzeżenia, listę kontrolną i instrukcje bezpieczeństwa

```
⚠️ CRITICAL - ALLERGIES TO AVOID (NEVER include these ingredients):
- orzechy (ABSOLUTELY FORBIDDEN)

SAFETY CHECKLIST - Before finalizing, verify:
1. No forbidden allergens in ingredients list
2. No forbidden allergens in shopping list  
3. No forbidden allergens in cooking instructions
4. No derivatives or variations of forbidden allergens
5. All ingredients are safe alternatives
```

📖 **Więcej szczegółów:** [Dokumentacja poprawek alergenów](docs/allergy-handling-improvements.md)

---

## 🍽️ O Projekcie

Healthy Meal to nowoczesna aplikacja webowa, która wykorzystuje sztuczną inteligencję do generowania spersonalizowanych przepisów kulinarnych. Aplikacja została zaprojektowana z myślą o bezpieczeństwie użytkowników z alergiami pokarmowymi i zapewnia zaawansowane funkcje zarządzania preferencjami żywieniowymi.

### Kluczowe Funkcjonalności

- **Bezpieczne Generowanie Przepisów**: AI jest specjalnie instruowane o unikaniu alergenów
- **Zarządzanie Preferencjami**: Kompleksowy system preferencji dietetycznych, kulinarnych i alergicznych
- **Analityka AI**: Szczegółowe śledzenie użycia AI i kosztów
- **System Oceny**: Możliwość oceniania przepisów i zapisywania ulubionych
- **Responsywny Design**: Nowoczesny interfejs użytkownika dostosowany do wszystkich urządzeń

Built with ❤️ using modern web technologies
