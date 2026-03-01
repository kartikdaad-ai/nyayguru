import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0b1120] via-[#111d3a] to-[#0f1629] py-20 sm:py-28">
      {/* Decorative glow */}
      <div className="absolute left-1/4 top-0 -z-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 -z-0 h-48 w-48 rounded-full bg-saffron/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Get Legal Clarity. For Free.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
          Join lakhs of Indians who trust NyayGuru for legal guidance. Start with
          100 free monthly queries. No payment required.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-dark hover:shadow-xl"
          >
            <MessageSquare className="h-5 w-5" />
            Start Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2">
          <span className="text-lg">🇮🇳</span>
          <span className="text-sm font-medium text-slate-400">
            Proudly Made in India
          </span>
        </div>
      </div>
    </section>
  );
}
