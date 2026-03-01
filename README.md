# ⚖️ NyayGuru — India's First Legal AI Chatbot

An AI-powered legal assistance platform for Indian law built with Next.js 14, TypeScript, and Tailwind CSS.

## ✨ Features

- 🤖 **AI Legal Chat** — Ask legal questions and get instant, structured answers with Act/Section references and case law citations
- 📄 **Document OCR** — Upload legal documents for analysis (UI ready)
- 🌐 **Multi-Language** — Hindi, English, Tamil, Telugu, Kannada, Marathi, Malayalam, and more
- 🎙️ **Voice Input** — Speak your queries naturally (UI ready)
- 🏛️ **Case Citations** — Supreme Court & High Court judgment references
- 🔒 **Privacy First** — Confidential, encrypted, no data sharing
- 📝 **Legal Drafting** — Help with notices, complaints, NDAs, contracts
- 🎨 **Dark/Light Mode** — Automatic theme support
- 📱 **Fully Responsive** — Works on all devices

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
# Install dependencies
npm install

# Create environment file (already created)
# Edit .env.local and add your OpenAI API key
```

### Environment Variables

Edit `.env.local`:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

> **Note:** The app works without an API key using built-in demo responses. Add your OpenAI key for full AI-powered answers.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
src/
├── app/
│   ├── api/chat/       — Chat API route (OpenAI integration)
│   ├── auth/login/     — Login page
│   ├── auth/signup/    — Signup page
│   ├── chat/           — AI chat interface
│   ├── globals.css     — Global styles & CSS variables
│   ├── layout.tsx      — Root layout with Navbar & Footer
│   └── page.tsx        — Landing page
├── components/
│   ├── Navbar.tsx          — Navigation bar
│   ├── Footer.tsx          — Site footer
│   ├── HeroSection.tsx     — Landing hero
│   ├── FeaturesSection.tsx — Features grid
│   ├── HowItWorksSection.tsx — 3-step process
│   ├── TestimonialsSection.tsx — User reviews
│   ├── PricingSection.tsx  — Free plan details
│   ├── FAQSection.tsx      — Accordion FAQ
│   └── CTASection.tsx      — Call to action
```

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 | React framework (App Router) |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Lucide React | Icons |
| OpenAI API | AI chat backend |

## 📄 License

This project is private and proprietary.
