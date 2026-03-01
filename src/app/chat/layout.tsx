import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat — NyayGuru Legal AI",
  description: "Ask legal questions and get instant AI-powered guidance on Indian law.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
