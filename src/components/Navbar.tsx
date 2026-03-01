"use client";

import Link from "next/link";
import { useState } from "react";
import { Scale, Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Nyay<span className="text-primary">Guru</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/case-analyzer"
              className="text-sm font-semibold text-saffron transition-colors hover:text-foreground"
            >
              ⭐ Case Analyzer
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/auth/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Log In
            </Link>
            <Link
              href="/chat"
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Start Free →
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-foreground md:hidden"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="border-t border-border pb-4 md:hidden">
            <div className="flex flex-col gap-2 pt-4">
              <Link
                href="/case-analyzer"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-saffron hover:bg-muted"
              >
                ⭐ Case Analyzer
              </Link>
              <Link
                href="#features"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                How It Works
              </Link>
              <Link
                href="#testimonials"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Testimonials
              </Link>
              <Link
                href="#pricing"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Pricing
              </Link>
              <Link
                href="#faq"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                FAQ
              </Link>
              <hr className="my-2 border-border" />
              <Link
                href="/auth/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Log In
              </Link>
              <Link
                href="/chat"
                className="mx-4 rounded-lg bg-primary px-5 py-2 text-center text-sm font-medium text-white hover:bg-primary-dark"
              >
                Start Free →
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
