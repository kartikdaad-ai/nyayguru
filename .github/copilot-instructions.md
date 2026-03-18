# NyayGuru Project Instructions

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **AI Backend**: Google Gemini API (free tier) + Mistral AI (fallback)

## Project Structure
- `src/app/` — App Router pages and layouts
- `src/app/api/` — API routes (chat endpoint)
- `src/app/auth/` — Authentication pages (login/signup)
- `src/app/chat/` — AI Chat interface
- `src/components/` — Reusable React components (Navbar, Footer, landing page sections)
- `src/lib/` — Utility functions and configurations

## Coding Conventions
- Use TypeScript strict mode
- Use functional components with React hooks
- Use Tailwind CSS utility classes for styling
- Follow Next.js App Router conventions (page.tsx, layout.tsx)
- Keep components modular — one component per file
- Use `@/` import alias for `src/` directory

## Key Features
- AI-powered legal chat for Indian law (Gemini + Mistral AI)
- AI Case Analyzer — 9-section court-ready analysis
- Case Lookup by ID — search by case name, citation, CNR number, or popular name
- Indian Kanoon API integration (optional, for enhanced case lookup)
- Demo mode works without API key (built-in demo responses)
- Multi-language support (Hindi, English, and other Indian languages)
- Document upload and OCR analysis (UI ready)
- Case law citations (Supreme Court & High Court)
- Legal drafting assistance
- Privacy-first architecture
- Responsive design with dark/light mode support
- NextAuth.js authentication (login/signup)
- Chat history persistence (localStorage)
- Voice input support (UI ready)

## Environment Variables
- `GEMINI_API_KEY` — Google Gemini API key for AI responses (free at https://aistudio.google.com/apikey)
- `GEMINI_MODEL` — Model to use (default: gemini-2.5-flash)
- `MISTRAL_API_KEY` — Mistral AI API key as fallback provider (free at https://console.mistral.ai/api-keys)
- `MISTRAL_MODEL` — Mistral model to use (default: mistral-small-latest)
- `INDIAN_KANOON_TOKEN` — Indian Kanoon API token for enhanced case lookup (optional, sign up at https://api.indiankanoon.org/)
