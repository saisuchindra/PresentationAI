# Development Guide

This document provides guidelines and setup instructions for developing on PresentationAI.

## Development Environment Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Git for version control
- A code editor (VS Code recommended)

### Setting Up Your Environment

1. **Fork and clone the repository:**
```bash
git clone https://github.com/saisuchindra/PresentationAI.git
cd PresentationAI
```

2. **Set up environment variables:**

Create a `.env.local` file in the `server` directory:
```
DATABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

3. **Install dependencies:**
```bash
# Install root dependencies (if any)
npm install

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

## Running Development Servers

### Terminal 1 - Backend
```bash
cd server
npm run dev
# Server will run on http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd client
npm run dev
# App will run on http://localhost:3000
```

## Project Structure Guidelines

### Frontend Structure
```
client/src/
├── app/
│   ├── page.tsx              # Home page
│   ├── generator/
│   │   └── page.tsx          # Presentation generator
│   ├── history/
│   │   └── page.tsx          # Saved presentations
│   ├── settings/
│   │   └── page.tsx          # User settings
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
└── lib/
    └── pptx.ts               # PowerPoint generation utilities
```

### Backend Structure
```
server/src/
├── index.ts                  # Server entry point
└── services/
    ├── ai.service.ts         # AI model integration
    ├── db.service.ts         # Database operations
    └── image.service.ts      # Image processing
```

## Code Style & Standards

### TypeScript
- Enable strict mode
- Use explicit return types
- Avoid `any` type unless necessary

### React/Next.js
- Use functional components
- Use React hooks for state management
- Keep components small and focused
- Use TypeScript for props

### Styling
- Use Tailwind CSS utility classes
- Follow the design philosophy (no AI slop)
- Maintain consistent spacing and typography
- Test responsive design

## Git Workflow

### Commit Messages
Follow the conventional commits format:
```
type: short description

Longer description explaining the changes and why
- Bullet point 1
- Bullet point 2
```

Types:
- `feat:` New feature
- `fix:` Bug fix
- `style:` Styling changes
- `refactor:` Code refactoring
- `chore:` Build, dependencies, etc.
- `docs:` Documentation changes
- `test:` Test additions/updates

### Creating a Feature Branch
```bash
git checkout -b feature/your-feature-name
# Make changes and commit
git push origin feature/your-feature-name
```

## Testing

### Run Linting
```bash
cd client
npm run lint
```

## Debugging

### Frontend
- Use VS Code debugger with Next.js extension
- Use browser DevTools (F12)
- Check Console Ninja extension output

### Backend
- Add console.log statements
- Use VS Code debugger
- Check terminal output

## Performance Considerations

1. **Frontend:**
   - Use Next.js Image component for images
   - Lazy load components where appropriate
   - Optimize bundle size

2. **Backend:**
   - Use connection pooling for database
   - Cache frequent queries
   - Implement rate limiting

## Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 3000
taskkill /PID 23992 /F

# Kill process on port 5000
taskkill /PID 5000 /F
```

### Module Not Found
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Rebuild TypeScript
npm run build

# Check for type errors
npx tsc --noEmit
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express Documentation](https://expressjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [pptxgenjs Documentation](https://gitbrent.github.io/PptxGenJS/)
