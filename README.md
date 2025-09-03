# LinkVault

A fullstack app with a Node.js/Express backend and React/Vite frontend.

## Deployment

- Add your secrets to `.env` files in `Backend`
- Push to GitHub.
- Connect to Vercel for automatic deployment.

## Environment Variables

### Backend
- DB_URL: Database connection string
- JWT_SECRET: JWT secret for authentication

### Frontend
- VITE_GEMINI_API_KEY: Gemini API key for chatbot

## Ignore Files

- `.gitignore` is set up for both frontend and backend.
- `.env` files are ignored from git.

## Vercel

- `vercel.json` is configured for API and static frontend deployment.
