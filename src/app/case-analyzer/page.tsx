"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  Scale,
  ArrowLeft,
  Loader2,
  Sparkles,
  BookOpen,
  Gavel,
  ScrollText,
  Lightbulb,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Download,
  X,
} from "lucide-react";

interface AnalysisResult {
  caseSummary: string;
  keyFacts: string;
  legalIssues: string;
  applicableLaws: string;
  similarCases: string;
  arguments: string;
  counterArguments: string;
  finalArgument: string;
  recommendation: string;
}

type AnalysisStep = {
  id: string;
  label: string;
  icon: React.ElementType;
  status: "pending" | "loading" | "done";
};

export default function CaseAnalyzerPage() {
  const [caseText, setCaseText] = useState("");
  const [fileName, setFileName] = useState("");
  const [clientSide, setClientSide] = useState<"petitioner" | "respondent">(
    "petitioner"
  );
  const [caseType, setCaseType] = useState("criminal");
  const [court, setCourt] = useState("district");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([
      "caseSummary",
      "keyFacts",
      "legalIssues",
      "applicableLaws",
      "similarCases",
      "arguments",
      "counterArguments",
      "finalArgument",
      "recommendation",
    ])
  );
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { id: "upload", label: "Reading case documents", icon: FileText, status: "pending" },
    { id: "summary", label: "Generating case summary", icon: BookOpen, status: "pending" },
    { id: "laws", label: "Identifying applicable laws", icon: ScrollText, status: "pending" },
    { id: "cases", label: "Finding similar verdicts", icon: Gavel, status: "pending" },
    { id: "arguments", label: "Building arguments", icon: Lightbulb, status: "pending" },
    { id: "final", label: "Preparing final argument", icon: Scale, status: "pending" },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCaseText(text);
    };
    reader.readAsText(file);
  };

  const removeFile = () => {
    setFileName("");
    setCaseText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const handleCopy = (section: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadAll = () => {
    if (!result) return;
    const fullText = `
═══════════════════════════════════════
  NYAYGURU AI — CASE ANALYSIS REPORT
═══════════════════════════════════════
Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
Case Type: ${caseType.charAt(0).toUpperCase() + caseType.slice(1)}
Court: ${court.charAt(0).toUpperCase() + court.slice(1)} Court
Client Side: ${clientSide.charAt(0).toUpperCase() + clientSide.slice(1)}

───────────────────────────────────────
1. CASE SUMMARY
───────────────────────────────────────
${result.caseSummary}

───────────────────────────────────────
2. KEY FACTS & TIMELINE
───────────────────────────────────────
${result.keyFacts}

───────────────────────────────────────
3. LEGAL ISSUES IDENTIFIED
───────────────────────────────────────
${result.legalIssues}

───────────────────────────────────────
4. APPLICABLE LAWS & SECTIONS
───────────────────────────────────────
${result.applicableLaws}

───────────────────────────────────────
5. SIMILAR CASES & VERDICTS
───────────────────────────────────────
${result.similarCases}

───────────────────────────────────────
6. ARGUMENTS FOR YOUR SIDE
───────────────────────────────────────
${result.arguments}

───────────────────────────────────────
7. ANTICIPATED COUNTER-ARGUMENTS
───────────────────────────────────────
${result.counterArguments}

───────────────────────────────────────
8. FINAL ARGUMENT (READY TO PRESENT)
───────────────────────────────────────
${result.finalArgument}

───────────────────────────────────────
9. STRATEGIC RECOMMENDATION
───────────────────────────────────────
${result.recommendation}

═══════════════════════════════════════
⚠️ DISCLAIMER: This AI-generated analysis is for informational and research purposes only.
It does not constitute formal legal advice. Please review with a qualified advocate before presenting in court.
═══════════════════════════════════════
    `.trim();

    const blob = new Blob([fullText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NyayGuru_Case_Analysis_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const simulateSteps = async () => {
    const stepIds = ["upload", "summary", "laws", "cases", "arguments", "final"];
    for (let i = 0; i < stepIds.length; i++) {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === stepIds[i] ? { ...s, status: "loading" } : s
        )
      );
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
      setSteps((prev) =>
        prev.map((s) =>
          s.id === stepIds[i] ? { ...s, status: "done" } : s
        )
      );
    }
  };

  const handleAnalyze = async () => {
    if (!caseText.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setSteps((prev) => prev.map((s) => ({ ...s, status: "pending" as const })));

    // Run step animation and API call in parallel
    const stepsPromise = simulateSteps();

    try {
      const res = await fetch("/api/case-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseText,
          clientSide,
          caseType,
          court,
        }),
      });

      const data = await res.json();
      await stepsPromise; // Wait for step animation to finish
      setResult(data);
    } catch {
      await stepsPromise;
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resultSections: {
    key: keyof AnalysisResult;
    title: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    { key: "caseSummary", title: "Case Summary", icon: BookOpen, color: "text-blue-500" },
    { key: "keyFacts", title: "Key Facts & Timeline", icon: FileText, color: "text-emerald-500" },
    { key: "legalIssues", title: "Legal Issues Identified", icon: AlertTriangle, color: "text-amber-500" },
    { key: "applicableLaws", title: "Applicable Laws & Sections", icon: ScrollText, color: "text-purple-500" },
    { key: "similarCases", title: "Similar Cases & Verdicts", icon: Gavel, color: "text-rose-500" },
    { key: "arguments", title: "Arguments for Your Side", icon: Lightbulb, color: "text-green-500" },
    { key: "counterArguments", title: "Anticipated Counter-Arguments", icon: AlertTriangle, color: "text-orange-500" },
    { key: "finalArgument", title: "Final Argument (Ready to Present)", icon: Scale, color: "text-primary" },
    { key: "recommendation", title: "Strategic Recommendation", icon: Sparkles, color: "text-indigo-500" },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  AI Case Analyzer
                </h1>
                <p className="text-xs text-muted-foreground">
                  Upload → Analyze → Present in Court
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-saffron/30 bg-saffron/5 px-3 py-1 text-xs font-semibold text-saffron sm:inline-flex">
              ⭐ Flagship Feature
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {!result ? (
          // INPUT FORM
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Left: Input */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-1 text-xl font-bold text-card-foreground">
                  Upload Your Case
                </h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  Paste case details or upload a document. Our AI will analyze
                  it end-to-end and prepare court-ready arguments.
                </p>

                {/* File Upload */}
                <div className="mb-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="case-file"
                  />
                  {fileName ? (
                    <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium text-card-foreground">
                          {fileName}
                        </span>
                      </div>
                      <button
                        onClick={removeFile}
                        className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="case-file"
                      className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-8 transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-card-foreground">
                          Drop your case file here or click to upload
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Supports TXT, PDF, DOC, DOCX
                        </p>
                      </div>
                    </label>
                  )}
                </div>

                {/* Divider */}
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">
                    or paste case details below
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Text Input */}
                <textarea
                  value={caseText}
                  onChange={(e) => setCaseText(e.target.value)}
                  placeholder="Paste the complete case details here — FIR copy, charge sheet, case history, facts, or any legal document text...

Example:
Case No. 123/2024 — Ram vs. Shyam
Filed under Section 420 IPC (now Section 318 BNS)
Facts: The complainant Ram alleges that the accused Shyam...
Prior history: The matter was first heard on..."
                  rows={12}
                  className="w-full resize-none rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />

                <p className="mt-2 text-right text-xs text-muted-foreground">
                  {caseText.length.toLocaleString()} characters
                </p>
              </div>
            </div>

            {/* Right: Options */}
            <div className="lg:col-span-2">
              <div className="sticky top-20 space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="mb-4 text-base font-semibold text-card-foreground">
                    Case Configuration
                  </h3>

                  {/* Client Side */}
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-card-foreground">
                      Your Client&apos;s Side
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setClientSide("petitioner")}
                        className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                          clientSide === "petitioner"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        Petitioner / Plaintiff
                      </button>
                      <button
                        onClick={() => setClientSide("respondent")}
                        className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                          clientSide === "respondent"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        Respondent / Defendant
                      </button>
                    </div>
                  </div>

                  {/* Case Type */}
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-card-foreground">
                      Type of Case
                    </label>
                    <select
                      value={caseType}
                      onChange={(e) => setCaseType(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="criminal">Criminal</option>
                      <option value="civil">Civil</option>
                      <option value="family">Family / Matrimonial</option>
                      <option value="property">Property / Land</option>
                      <option value="consumer">Consumer</option>
                      <option value="labour">Labour / Employment</option>
                      <option value="corporate">Corporate / Commercial</option>
                      <option value="constitutional">Constitutional / Writ</option>
                      <option value="tax">Tax / GST</option>
                      <option value="cyber">Cyber Crime</option>
                      <option value="motor-accident">Motor Accident Claims</option>
                      <option value="arbitration">Arbitration</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Court Level */}
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-card-foreground">
                      Court Level
                    </label>
                    <select
                      value={court}
                      onChange={(e) => setCourt(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="district">District Court</option>
                      <option value="sessions">Sessions Court</option>
                      <option value="high-court">High Court</option>
                      <option value="supreme-court">Supreme Court</option>
                      <option value="tribunal">Tribunal (NCLT/NCLAT/ITAT/NGT)</option>
                      <option value="consumer-forum">Consumer Forum</option>
                      <option value="family-court">Family Court</option>
                      <option value="labour-court">Labour Court</option>
                    </select>
                  </div>

                  {/* Analyze Button */}
                  <button
                    onClick={handleAnalyze}
                    disabled={!caseText.trim() || isAnalyzing}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-purple-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Analyzing Case...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Analyze Case
                      </>
                    )}
                  </button>
                </div>

                {/* Analysis Progress */}
                {isAnalyzing && (
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="mb-4 text-sm font-semibold text-card-foreground">
                      Analysis Progress
                    </h3>
                    <div className="space-y-3">
                      {steps.map((step) => (
                        <div
                          key={step.id}
                          className="flex items-center gap-3"
                        >
                          {step.status === "loading" ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : step.status === "done" ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-border" />
                          )}
                          <span
                            className={`text-sm ${
                              step.status === "loading"
                                ? "font-medium text-primary"
                                : step.status === "done"
                                ? "text-muted-foreground line-through"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* What you get */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="mb-3 text-sm font-semibold text-card-foreground">
                    What You&apos;ll Get
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      End-to-end case summary
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Key facts & timeline extraction
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Applicable laws & sections
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Similar Supreme Court & High Court verdicts
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Arguments for your side
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Counter-arguments to prepare for
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Court-ready final argument draft
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Strategic recommendation
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // RESULTS VIEW
          <div>
            {/* Result Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  📋 Case Analysis Report
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case •{" "}
                  {court
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}{" "}
                  • {clientSide.charAt(0).toUpperCase() + clientSide.slice(1)}{" "}
                  Side
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadAll}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setCaseText("");
                    setFileName("");
                  }}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Analyze New Case
                </button>
              </div>
            </div>

            {/* Result Sections */}
            <div className="space-y-4">
              {resultSections.map(({ key, title, icon: Icon, color }) => {
                const content = result[key];
                if (!content) return null;
                const isExpanded = expandedSections.has(key);

                return (
                  <div
                    key={key}
                    className="rounded-xl border border-border bg-card overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => toggleSection(key)}
                      className="flex w-full items-center justify-between p-5 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${color}`} />
                        <span className="text-base font-semibold text-card-foreground">
                          {title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(key, content);
                          }}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Copy section"
                        >
                          {copiedSection === key ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border px-5 pb-5 pt-4">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                          {content}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Disclaimer */}
            <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Important Disclaimer
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    This AI-generated case analysis is for informational and
                    research purposes only. It does not constitute formal legal
                    advice or opinion. The arguments, case citations, and
                    recommendations should be thoroughly reviewed and verified
                    by a qualified advocate before being presented in any court
                    or legal proceeding. NyayGuru is an AI tool meant to assist
                    lawyers, not replace their professional judgment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
