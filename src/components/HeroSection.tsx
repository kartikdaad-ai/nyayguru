import Link from "next/link";
import { MessageSquare, ArrowRight, Scale } from "lucide-react";

const sampleQuestions = [
  "What are tenant rights in India?",
  "How to file a consumer complaint?",
  "Explain Domestic Violence Act",
  "What is Section 498A IPC?",
];

export function HeroSection() {
  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              🇮🇳 #1 Legal AI Chatbot of India
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="gradient-text">India&apos;s First</span>
              <br />
              Legal AI Chatbot
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Ask questions on Indian law. Get instant, AI-powered legal
              guidance. <strong>Free and confidential.</strong>
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/case-analyzer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              >
                <Scale className="h-5 w-5" />
                Analyze Your Case
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-8 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <MessageSquare className="h-5 w-5" />
                Free Legal Chat
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
              <span className="flex items-center gap-1">
                ✅ Free to use
              </span>
              <span className="flex items-center gap-1">
                🔒 100% Private
              </span>
              <span className="flex items-center gap-1">
                🌐 Any Language
              </span>
              <span className="flex items-center gap-1">
                📄 Upload PDFs
              </span>
            </div>

            {/* Made in India */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/5 px-4 py-2">
              <span className="text-lg">🇮🇳</span>
              <span className="text-sm font-semibold">
                <span className="text-saffron">Made</span>{" "}
                <span className="text-foreground">in</span>{" "}
                <span className="text-green-india">India</span>
              </span>
              <span className="text-xs text-muted-foreground">| Proudly Indian</span>
            </div>
          </div>

          {/* Right - Chat Preview */}
          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">
                    NyayGuru AI
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hello, how can I help you today?
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {sampleQuestions.map((q, i) => (
                  <Link
                    key={i}
                    href="/chat"
                    className="block rounded-lg border border-border bg-muted/50 p-3 text-sm text-card-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    {q}
                  </Link>
                ))}
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Free to use · Your questions are confidential
              </p>
            </div>

            {/* Decorative glow */}
            <div className="absolute -right-4 -top-4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-4 -left-4 -z-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
