# HealthyMeal

HealthyMeal is an AI-powered mobile-first application designed to simplify home cooking by providing personalized culinary recipes.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

Many users struggle to adapt generic online recipes to their specific dietary requirements, such as vegetarianism, food allergies, or taste preferences. This process can be time-consuming and frustrating, often leading them to abandon home cooking for less healthy or monotonous meal options.

HealthyMeal addresses this challenge by leveraging the power of AI (OpenAI's GPT-4o model) to deliver instant, personalized recipes. Users can make requests in natural language (e.g., "a chicken and broccoli dinner idea") and receive a complete, structured recipe that automatically incorporates their pre-defined dietary profile. The core goal is to inspire and facilitate daily cooking with solutions tailored to each individual.

## Tech Stack

This project utilizes a modern, type-safe, and efficient technology stack:

-   **Frontend:**
    -   **Framework:** [Astro 5](https://astro.build/)
    -   **UI Components:** [React 19](https://react.dev/)
    -   **Language:** [TypeScript 5](https://www.typescriptlang.org/)
    -   **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
    -   **Component Library:** [Shadcn/ui](https://ui.shadcn.com/)

-   **Backend (BaaS):**
    -   **Platform:** [Supabase](https://supabase.com/)
    -   **Database:** PostgreSQL
    -   **Authentication:** Built-in user authentication (Email/Password, OAuth)

-   **Artificial Intelligence:**
    -   **API Service:** [OpenRouter.ai](https://openrouter.ai/) for access to a wide range of AI models, including OpenAI GPT-4o.

-   **DevOps:**
    -   **CI/CD:** [GitHub Actions](https://github.com/features/actions)
    -   **Hosting:** [DigitalOcean](https://www.digitalocean.com/) via a Docker container.

## Getting Started Locally

To set up and run this project on your local machine, follow these steps.

### Prerequisites

-   [Node.js](https://nodejs.org/) (LTS version recommended)
-   [npm](https://www.npmjs.com/) (or another package manager like `pnpm` or `yarn`)
-   A [Supabase](https://supabase.com/) account to get database and authentication credentials.
-   An [OpenRouter.ai](https://openrouter.ai/) account to get an API key.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/psmolich79/healthy-meal.git](https://github.com/psmolich79/healthy-meal.git)
    cd healthy-meal
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root of the project and add the necessary credentials. Use the `.env.example` as a template:

    ```env
    # .env.example

    # Supabase credentials
    SUPABASE_URL="YOUR_SUPABASE_URL"
    SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

    # OpenRouter.ai API Key
    OPENROUTER_API_KEY="YOUR_OPENROUTER_API_KEY"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running locally at `http://localhost:4321`.

## Available Scripts

This project includes the following scripts defined in `package.json`:

-   `npm run dev`: Starts the application in development mode with hot-reloading.
-   `npm run build`: Compiles and builds the application for production.
-   `npm run preview`: Starts a local server to preview the production build.
-   `npm run lint`: Runs the ESLint linter to identify issues in the codebase.
-   `npm run lint:fix`: Runs ESLint and attempts to fix any auto-fixable issues.
-   `npm run format`: Formats all source files using Prettier.

## Project Scope

The scope for the Minimum Viable Product (MVP) is defined as follows.

### In Scope (MVP)

-   **User Authentication:** System for registration and login via email/password and Google (OAuth 2.0).
-   **User Profile:** A dedicated screen for users to define and manage their dietary preferences using a predefined list of checkboxes.
-   **AI Recipe Generation:** A simple interface to generate recipes using AI based on a natural language query and the user's saved preferences.
-   **Recipe Interaction:** A structured view for recipes (Ingredients, Shopping List, Instructions) with options to save the recipe and provide a thumbs up/down rating.
-   **Saved Recipe Management:** A "My Recipes" section to view and delete saved recipes.

### Out of Scope (MVP)

-   Importing recipes from external URLs.
-   Support for multimedia content (e.g., adding photos to recipes).
-   Social features like sharing recipes or commenting.
-   Advanced categorization of the shopping list (e.g., by grocery store aisle).
-   Recipe validation by a second, independent AI model.

## Project Status

**Current Stage: In Development**

This project is currently in the development phase of its **Minimum Viable Product (MVP)**. The core features are being built based on the provided product requirements and user stories. The current version is `0.0.1`.

## License

This project is not yet licensed. A license will be chosen and added at a later date.