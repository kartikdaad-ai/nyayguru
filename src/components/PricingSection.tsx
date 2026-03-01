import Link from "next/link";
import {
  MessageSquare,
  FileSearch,
  StickyNote,
  Download,
  ShieldCheck,
  Globe,
  Check,
} from "lucide-react";

const freeFeatures = [
  {
    icon: MessageSquare,
    title: "AI Legal Assistance",
    items: [
      "AI legal chat (short–detailed)",
      "AI legal research & strategy",
      "AI legal drafting",
      "AI legal translation",
    ],
  },
  {
    icon: FileSearch,
    title: "Documents & Research",
    items: [
      "Chat with PDFs & docs (OCR)",
      "Live legal web search",
      "Notes & collections",
      "Download & share chats",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Privacy & Control",
    items: [
      "Temporary chats (privacy mode)",
      "Secure cloud storage",
      "Data export & backup",
      "Multi-language support",
    ],
  },
];

const highlights = [
  "100 free queries per month",
  "No signup required to start",
  "No payment or card needed",
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-muted/50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            NyayGuru is{" "}
            <span className="text-primary">free forever</span> for
            everyday legal needs.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Get up to 100 free legal queries every month. No payment required.
            Built for individuals. Upgrade only if you need more.
          </p>
        </div>

        {/* Feature columns */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {freeFeatures.map((group, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <group.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-card-foreground">
                  {group.title}
                </h3>
              </div>
              <ul className="space-y-3">
                {group.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-india" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <p className="mb-4 text-sm font-semibold text-primary">
            ✔ All above features are available for free
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {highlights.map((h, i) => (
              <span
                key={i}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <Check className="h-4 w-4 text-green-india" />
                {h}
              </span>
            ))}
          </div>
          <Link
            href="/chat"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Start Free →
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            Most users never need to upgrade.
          </p>
        </div>
      </div>
    </section>
  );
}
