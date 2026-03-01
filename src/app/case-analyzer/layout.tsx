import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Case Analyzer — NyayGuru",
  description:
    "Upload your case, get end-to-end analysis, similar verdicts, arguments, and a court-ready final argument. Flagship AI tool for Indian lawyers.",
};

export default function CaseAnalyzerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
