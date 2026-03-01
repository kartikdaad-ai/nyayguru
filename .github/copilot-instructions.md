# NyayGuru Project Instructions

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **AI Backend**: OpenAI API (configurable)

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
- AI-powered legal chat for Indian law (OpenAI integration)
- Demo mode works without API key (built-in demo responses)
- Multi-language support (Hindi, English, and other Indian languages)
- Document upload and OCR analysis (UI ready)
- Case law citations (Supreme Court & High Court)
- Legal drafting assistance
- Privacy-first architecture
- Responsive design with dark/light mode support
- Voice input support (UI ready)

## Environment Variables
- `OPENAI_API_KEY` — OpenAI API key for AI responses
- `OPENAI_MODEL` — Model to use (default: gpt-4o-mini)
