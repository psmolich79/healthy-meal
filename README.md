# Healthy Meal - AI-Powered Recipe Management

A modern web application for generating, managing, and organizing AI-powered recipes based on user preferences and dietary requirements.

## 🚀 Features

- **AI Recipe Generation**: Generate personalized recipes using advanced AI models (GPT-4, GPT-3.5 Turbo, Claude)
- **User Preferences**: Store and apply dietary preferences to recipe generation
- **Recipe Management**: Create, view, update visibility, and regenerate recipes
- **Smart Pagination**: Efficient recipe browsing with filtering and sorting
- **Rate Limiting**: Intelligent rate limiting for AI generation (10 per hour per user)
- **Cost Tracking**: Monitor AI usage costs and token consumption
- **Secure API**: JWT-based authentication with Row-Level Security (RLS)

## 🛠️ Tech Stack

- **Frontend**: Astro 5 + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 + Shadcn/ui
- **Backend**: Astro Server Endpoints + Supabase
- **Database**: PostgreSQL with RLS policies
- **Authentication**: Supabase Auth with JWT
- **AI Integration**: OpenAI GPT + Anthropic Claude (configurable)
- **Testing**: Vitest + Testing Library
- **Validation**: Zod schemas

## 📁 Project Structure

```
healthy-meal/
├── src/
│   ├── components/          # UI components (Astro + React)
│   ├── db/                 # Supabase client and types
│   ├── lib/
│   │   ├── config/         # Configuration files
│   │   ├── services/       # Business logic services
│   │   └── schemas/        # Zod validation schemas
│   ├── middleware/         # Authentication middleware
│   ├── pages/
│   │   ├── api/            # REST API endpoints
│   │   └── index.astro     # Main page
│   ├── styles/             # Global CSS
│   └── test/               # Test files
├── supabase/               # Database migrations
├── docs/                   # API documentation
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
| `GET` | `/api/recipes` | List recipes with pagination |

### Profile Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profiles/me` | Get user profile |
| `PUT` | `/api/profiles/me` | Update preferences |
| `DELETE` | `/api/profiles/me` | Schedule deletion |

## 🔧 Configuration

### AI Models

The application supports multiple AI models with different capabilities:

- **GPT-4**: Most capable, best for complex recipes
- **GPT-3.5 Turbo**: Fast and cost-effective
- **Claude 3 Sonnet**: Excellent for detailed instructions

### Rate Limiting

- **Recipe Generation**: 10 per hour per user
- **Recipe Regeneration**: Same limit as generation
- **Other Operations**: No rate limiting

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## 📖 API Documentation

Complete API documentation is available in the `docs/` directory:

- [Recipe API Documentation](docs/api-recipes.md)
- [Profile API Documentation](docs/api-profiles.md)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Row-Level Security (RLS)**: Database-level access control
- **Input Validation**: Zod schema validation for all inputs
- **Rate Limiting**: Protection against abuse
- **CORS Protection**: Configurable cross-origin policies

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

The application is configured for static site generation with server-side rendering where needed.

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

- [ ] Real-time AI model integration
- [ ] Recipe sharing and social features
- [ ] Advanced filtering and search
- [ ] Recipe rating and reviews
- [ ] Meal planning and scheduling
- [ ] Nutritional information integration
- [ ] Mobile app development

---

Built with ❤️ using modern web technologies
