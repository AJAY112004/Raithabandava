# Raitha Bandhava Hub - College Project Report

## Project Overview
Raitha Bandhava Hub is a comprehensive agricultural technology platform built with React, TypeScript, and Supabase. The application provides farmers with tools for crop planning, disease detection, weather forecasting, market price tracking, and financial management.

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Shadcn/ui (Radix UI components)
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form
- **Package Manager**: npm

## Prerequisites
Before running this project, ensure you have the following installed:

- **Node.js** (v16 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Edge, or Safari)

## Installation Instructions

### Step 1: Extract/Navigate to Project Directory
```bash
cd raitha-bandhava-hub
```

### Step 2: Install Dependencies
```bash
npm install
```
This command will install all required packages listed in `package.json`, including React, Vite, Tailwind CSS, and Supabase libraries.

### Step 3: Configure Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY
VITE_OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

**Note**: The default values in `src/integrations/supabase/client.ts` are placeholders and must be replaced with actual Supabase credentials for the application to function properly.

## Running the Project

### Development Mode
To start the development server with hot module replacement:

```bash
npm run dev
```

The application will start at `http://localhost:5173/` (or another port if 5173 is in use). The page will automatically reload when you make changes to the code.

### Build for Production
To create an optimized production build:

```bash
npm run build
```

This generates a `dist/` folder containing the compiled and minified application.

### Preview Production Build
To preview the production build locally:

```bash
npm run preview
```

### Code Linting
To check for code quality issues:

```bash
npm run lint
```

## Project Structure

```
raitha-bandhava-hub/
├── src/
│   ├── pages/              # Page components (Dashboard, Auth, etc.)
│   ├── components/         # Reusable UI components
│   │   └── ui/            # Shadcn/ui component library
│   ├── contexts/          # React Context (Authentication)
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # Third-party integrations (Supabase)
│   ├── lib/               # Utility functions
│   ├── data/              # Static JSON data
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── supabase/              # Supabase configuration
│   ├── functions/         # Edge Functions (Deno)
│   └── migrations/        # Database migrations
├── public/                # Static assets
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── eslint.config.js       # ESLint rules
```

## Key Features

### 1. **Authentication**
- User registration and login via Supabase Auth
- Profile management
- Secure session handling

### 2. **Crop Planning**
- Crop selection and scheduling
- Seasonal recommendations
- Weather-based planning

### 3. **Disease Detection**
- Image-based crop disease detection using AI
- Disease recommendations and remedies
- Historical detection records

### 4. **Weather Forecasting**
- Real-time weather data
- 7-day weather forecast
- Weather alerts for farmers

### 5. **Market Prices**
- Real-time agricultural commodity prices
- Price trend analysis
- Market insights

### 6. **Financial Management**
- Income and expense tracking
- Government scheme information
- Financial planning tools

### 7. **Supply Chain**
- Product tracking
- Harvest management
- Distribution logistics

### 8. **Community**
- Farmer-to-farmer communication
- Knowledge sharing
- Community notifications

## Database Schema
The project uses PostgreSQL (via Supabase) with tables for:
- Users and profiles
- Crops and planting records
- Disease detection records
- Market prices
- Financial transactions
- Supply chain operations
- Community messages

## API Integration
The application integrates with:
- **Supabase APIs** - User authentication, database operations, real-time updates
- **OpenWeather API** - Weather data and forecasts
- **OpenAI API** - Disease detection analysis

## Build Configuration

### Vite Configuration
- **Development**: Fast HMR (Hot Module Replacement)
- **Production**: Optimized build with code splitting
- **Target**: ES2020+

### TypeScript
- Strict mode enabled
- Path aliases configured (`@/` points to `src/`)

### Tailwind CSS
- Custom configuration for agricultural theme
- Dark mode support
- PostCSS for optimization

## Troubleshooting

### Issue: Port 5173 already in use
**Solution**: Vite will automatically use the next available port. Check the console output for the actual port.

### Issue: Dependencies installation fails
**Solution**: 
```bash
npm cache clean --force
npm install
```

### Issue: TypeScript errors in IDE
**Solution**: Ensure your IDE is using the workspace TypeScript version:
- VS Code: Ctrl+Shift+P → "TypeScript: Select TypeScript Version" → "Use Workspace Version"

### Issue: Module not found errors
**Solution**: Verify that all path aliases in `tsconfig.json` match the actual directory structure.

## Performance Optimization
- Code splitting via Vite
- Lazy loading of pages
- Image optimization
- React Query caching
- CSS minification via Tailwind

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (14+)
- Edge (latest)

## Notes for College Submission
1. **Secrets Removed**: All API keys and credentials have been replaced with placeholders
2. **node_modules Excluded**: Install dependencies using `npm install`
3. **Database Setup**: Requires a Supabase project for full functionality
4. **Edge Functions**: Supabase Edge Functions are written in Deno and run on the server

## How to Add Your Own Credentials
To make this project fully functional:

1. Create a [Supabase](https://supabase.com) project
2. Get your project URL and publishable key
3. Obtain API keys from [OpenWeather](https://openweathermap.org/) and [OpenAI](https://openai.com/)
4. Create `.env.local` file with your credentials
5. Run `npm install` and `npm run dev`

## Additional Resources
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)

## Contact & Support
For questions about this project, refer to the inline code comments and configuration files.

---

**Project Type**: Academic/College Project
**Created**: December 2025
**Version**: 1.0.0
