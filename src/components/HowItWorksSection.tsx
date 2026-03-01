import { PenLine, BrainCircuit, CheckCircle2 } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: PenLine,
    title: "Ask Your Question",
    description:
      "Type or speak your legal question in plain language. No legal jargon needed.",
  },
  {
    num: "02",
    icon: BrainCircuit,
    title: "Get AI Analysis",
    description:
      "Our AI analyzes your query against Indian laws, case precedents, and legal frameworks.",
  },
  {
    num: "03",
    icon: CheckCircle2,
    title: "Receive Guidance",
    description:
      "Get clear, actionable advice with relevant law sections, case citations, and next steps.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-muted/50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Legal Help in{" "}
            <span className="text-primary">3 Simple Steps</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            No appointments, no waiting rooms. Get legal guidance whenever you
            need it.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-12 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-primary/30 to-primary/10 md:block" />
              )}

              <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10">
                <step.icon className="h-10 w-10 text-primary" />
                <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {step.num}
                </span>
              </div>

              <h3 className="mb-3 text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
