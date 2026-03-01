"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is NyayGuru free?",
    answer:
      "Yes! NyayGuru is free forever for everyday legal needs. You get 100 free legal queries every month — no signup, no payment, and no credit card required. Paid plans are only for heavy users who need more queries.",
  },
  {
    question: "Is this legal advice?",
    answer:
      "No. NyayGuru provides legal information and guidance for educational and general awareness purposes. It is not a substitute for professional legal advice from a qualified advocate. For matters involving court proceedings or formal legal action, we recommend consulting a licensed lawyer.",
  },
  {
    question: "Who is this for?",
    answer:
      "NyayGuru is for everyone — common citizens with everyday legal questions, advocates looking for quick case references, law students doing research, HR professionals needing labour law references, startup founders navigating compliance, and anyone who wants to understand Indian law better.",
  },
  {
    question: "What are the areas of law NyayGuru can help with?",
    answer:
      "NyayGuru covers virtually all areas of Indian law including Criminal Law (IPC/BNS), Civil Law, Constitutional Law, Family Law, Property Law, Labour & Employment Law, Consumer Protection, Corporate & Commercial Law, Tax & GST, Cyber Law, Environmental Law, Intellectual Property, and more.",
  },
  {
    question: "What types of legal queries can NyayGuru answer?",
    answer:
      "You can ask anything from simple questions like 'What is Section 302?' to complex scenarios like 'My landlord is refusing to return my security deposit — what are my legal options?' NyayGuru can also help with legal drafting, document analysis, case law research, and legal strategy.",
  },
  {
    question: "Is my data safe and private?",
    answer:
      "Absolutely. Your data is encrypted and never shared with third parties. All conversations are 100% confidential. We also offer temporary chat mode where nothing is saved at all. You can export or delete your data at any time.",
  },
  {
    question: "Which languages are supported?",
    answer:
      "NyayGuru supports all major Indian languages including Hindi, English, Marathi, Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, Punjabi, Odia, Urdu, and more. Simply type or speak in your preferred language.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked{" "}
            <span className="text-primary">Questions</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Got questions about our legal AI chatbot? We&apos;ve got answers.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="pr-4 text-sm font-semibold text-card-foreground sm:text-base">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="border-t border-border px-5 pb-5 pt-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
