# Raitha Bandhava Hub - Frontend Only Version

## Project Overview
Raitha Bandhava Hub is a comprehensive agricultural technology platform built with React, TypeScript. The application provides farmers with tools for crop planning, disease detection, weather forecasting, market price tracking, and financial management. This version runs entirely in the frontend with mock data - no backend or database required.

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Shadcn/ui (Radix UI components)
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form
- **Package Manager**: npm
- **Data Storage**: Local browser storage (localStorage) for persistence

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
This command will install all required packages listed in `package.json`, including React, Vite, and Tailwind CSS.

### Step 3: Run the Application
No environment variables or backend setup required - everything runs locally with mock data.

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
│   ├── integrations/      # Third-party integrations (Mock Supabase)
│   ├── lib/               # Utility functions
│   ├── data/              # Static JSON data
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
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
1. **Frontend Only**: No backend or database required - runs entirely in browser with mock data
2. **node_modules Excluded**: Install dependencies using `npm install`
3. **Data Persistence**: Uses localStorage for user data and chat messages
4. **Mock Features**: All features work with simulated data for demonstration

## How to Run
Simply run:
```bash
npm install
npm run dev
```
No API keys or external services required!

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
