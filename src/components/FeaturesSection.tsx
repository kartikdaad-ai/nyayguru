import Link from "next/link";
import {
  MessageSquare,
  FileSearch,
  StickyNote,
  Landmark,
  HardDrive,
  Globe,
  Mic,
  ShieldCheck,
  Scale,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI Legal Chat",
    description:
      "Get instant answers to complex legal questions with our advanced AI trained on Indian law.",
  },
  {
    icon: FileSearch,
    title: "Document OCR",
    description:
      "Upload legal documents and extract text with high accuracy for quick analysis.",
  },
  {
    icon: StickyNote,
    title: "Smart Notes",
    description:
      "Organize your legal research with saved chats, quick notes, collections, and full-text search.",
  },
  {
    icon: Landmark,
    title: "Case Laws",
    description:
      "Trained on a huge collection of Indian case laws, judgments, and legal precedents.",
  },
  {
    icon: HardDrive,
    title: "Files Storage",
    description:
      "Store and manage all your legal documents (doc/pdf/image/txt) securely in the cloud.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description:
      "Get legal help in Hindi, English, Marathi, Tamil, Telugu, Kannada, Malayalam or any Indian language.",
  },
  {
    icon: Mic,
    title: "Voice Input",
    description:
      "Speak your legal queries naturally with our smart & advanced voice-to-text support.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "Your data is encrypted and never shared. Complete confidentiality guaranteed.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need for{" "}
            <span className="text-primary">Legal Matters</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            From instant AI consultations to document management, NyayGuru is
            your complete legal companion.
          </p>
        </div>

        {/* Flagship Feature: Case Analyzer */}
        <div className="mt-12">
          <Link href="/case-analyzer" className="block">
            <div className="group relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-purple-500/5 p-8 transition-all hover:border-primary/50 hover:shadow-xl">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-purple-500/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-xs font-semibold text-saffron">
                    ⭐ FLAGSHIP FEATURE
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-card-foreground">
                    AI Case Analyzer
                  </h3>
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Upload any case — get a complete end-to-end analysis. Case summary, key facts,
                    applicable laws, similar Supreme Court &amp; High Court verdicts, arguments for
                    your side, counter-arguments, and a <strong>court-ready final argument</strong> —
                    all in seconds.
                  </p>
                  <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                    <li className="flex items-center gap-1">✅ Case Summary</li>
                    <li className="flex items-center gap-1">✅ Similar Verdicts</li>
                    <li className="flex items-center gap-1">✅ Legal Arguments</li>
                    <li className="flex items-center gap-1">✅ Final Argument</li>
                  </ul>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg transition-transform group-hover:scale-110">
                    <Scale className="h-7 w-7" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Other Features */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
