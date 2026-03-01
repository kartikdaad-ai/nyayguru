import { Star, Users, MessageCircle, Award } from "lucide-react";

const stats = [
  { icon: Users, value: "500K+", label: "Users Served" },
  { icon: MessageCircle, value: "10M+", label: "Legal Queries Answered" },
  { icon: Award, value: "4.8★", label: "User Rating" },
];

const testimonials = [
  {
    name: "Rajesh Gupta",
    role: "Small Business Owner, Delhi",
    initials: "RG",
    content:
      "NyayGuru helped me understand matrimonial laws and making legal strategy in dealing with my divorce matter. The chatbot explains everything in simple Hindi and English. This free AI tool saved me a lot in lawyer fees!",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "HR Professional, Mumbai",
    initials: "PS",
    content:
      "As an HR manager, I use NyayGuru daily for quick references on labour laws. It's like having an advocate on call 24/7. The document analysis feature is incredibly accurate.",
    rating: 5,
  },
  {
    name: "Amit Patel",
    role: "Startup Founder, Bangalore",
    initials: "AP",
    content:
      "From company registration to contract reviews, NyayGuru has been invaluable. It helped me draft NDAs and understand GST compliance without expensive consultations.",
    rating: 5,
  },
  {
    name: "Dr. Sunita Reddy",
    role: "Medical Professional, Hyderabad",
    initials: "SR",
    content:
      "Needed clarity on medical malpractice laws for my clinic. NyayGuru provided detailed explanations with actual case references. Very helpful for healthcare professionals.",
    rating: 5,
  },
  {
    name: "Mohammed Hussain",
    role: "Real Estate Agent, Chennai",
    initials: "MH",
    content:
      "Property law queries come up daily in my work. NyayGuru helps me answer them instantly with proper section references. It made me look knowledgeable to my clients!",
    rating: 5,
  },
  {
    name: "Kavitha Nair",
    role: "Homemaker, Kerala",
    initials: "KN",
    content:
      "Filed a consumer complaint successfully using NyayGuru's guidance. The step-by-step instructions were so clear that I didn't need to hire a lawyer. Got my refund within 3 months!",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by <span className="text-primary">Lakhs of Indians</span>
          </h2>
        </div>

        {/* Stats */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-10">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="flex items-center justify-center gap-2">
                <stat.icon className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold text-foreground">
                  {stat.value}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-muted-foreground">
          Since 2023, we&apos;ve been India&apos;s first and most trusted legal
          AI bot, helping citizens navigate complex legal matters.
        </p>

        {/* Testimonial cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.content}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
