import { NextRequest, NextResponse } from "next/server";

const CASE_ANALYZER_PROMPT = `You are NyayGuru Case Analyzer — an advanced AI legal research assistant built exclusively for Indian lawyers and advocates. Your job is to perform a comprehensive, end-to-end analysis of a legal case and produce a court-ready report.

You will receive:
- The case details / document text
- Which side the lawyer represents (petitioner/plaintiff OR respondent/defendant)
- Type of case (criminal, civil, family, property, etc.)
- Court level (District, Sessions, High Court, Supreme Court, Tribunal, etc.)

You MUST return a JSON object with EXACTLY these 9 keys. Each value must be a detailed, well-structured string (use line breaks, numbering, bullet points within the string).

{
  "caseSummary": "...",
  "keyFacts": "...",
  "legalIssues": "...",
  "applicableLaws": "...",
  "similarCases": "...",
  "arguments": "...",
  "counterArguments": "...",
  "finalArgument": "...",
  "recommendation": "..."
}

## Instructions for each section:

### 1. caseSummary
Write a comprehensive summary of the case in 200-400 words. Include:
- Parties involved and their relationship
- Nature of dispute
- Brief chronology of events
- Current stage of proceedings
- Relief sought

### 2. keyFacts
Extract and list all key facts in chronological order. Number each fact. Highlight facts that are legally significant. Separate undisputed facts from disputed ones.

### 3. legalIssues
Identify all legal issues and questions of law that arise in this case. Frame them as specific legal questions. For example: "Whether the accused had mens rea as required under Section 302 IPC?"

### 4. applicableLaws
List ALL applicable statutes, sections, rules, articles, and legal provisions. Include:
- Primary legislation (with exact section numbers)
- Both old and new law references (IPC → BNS, CrPC → BNSS, Evidence Act → BSA)
- Relevant rules and regulations
- Constitutional provisions if applicable
- Procedural law provisions

### 5. similarCases
Find and cite 5-8 similar cases from the Supreme Court and High Courts. For EACH case provide:
- Full case name with citation and year
- Brief facts (2-3 lines)
- Ratio decidendi (key legal principle held)
- How it applies to the present case
- Whether the verdict favors or goes against our client

### 6. arguments
Draft 6-10 strong legal arguments FOR the client's side. Each argument should:
- State the legal proposition clearly
- Reference the specific law section
- Cite supporting case law
- Connect to the facts of this case
- Be persuasive and logically structured

### 7. counterArguments
Anticipate 4-6 arguments the opposing side is likely to make. For each:
- State the likely argument
- Assess its strength (strong/moderate/weak)
- Provide a rebuttal or counter to it

### 8. finalArgument
Draft a complete, polished final argument that the lawyer can present in court. This should:
- Open with a strong statement
- Present facts clearly
- Walk through each legal issue
- Cite relevant precedents
- Address and rebut opposing arguments
- Close with a compelling prayer/request to the court
- Be written in formal legal language suitable for court
- Be 400-800 words

### 9. recommendation
Provide strategic advice to the lawyer including:
- Strengths and weaknesses of the case
- Probability assessment (strong/moderate/weak case)
- Settlement vs. litigation recommendation
- Key evidence to focus on
- Witnesses to examine
- Procedural steps to take
- Timeline expectations
- Any alternative remedies available

## CRITICAL RULES:
- Be specific to Indian law ONLY
- Reference actual Indian case law (real citations)
- Use correct legal terminology
- Be thorough and detailed — this is for a practicing lawyer
- Return ONLY valid JSON, no markdown code blocks
- Every section must have substantial content (minimum 150 words each)`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseText, clientSide, caseType, court } = body;

    if (!caseText) {
      return NextResponse.json(
        { error: "Case text is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const mistralApiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey && !mistralApiKey) {
      return NextResponse.json(generateDemoAnalysis(caseType, clientSide, court));
    }

    const userMessage = `
CASE DETAILS:
${caseText}

CONFIGURATION:
- Client Side: ${clientSide}
- Case Type: ${caseType}
- Court Level: ${court}

Analyze this case completely and return the JSON response.`;

    // If only Mistral key is available (no Gemini), skip straight to Mistral
    if (!apiKey && mistralApiKey) {
      console.log("No Gemini key — using Mistral AI for case analysis");
      const mistralModel = process.env.MISTRAL_MODEL || "mistral-small-latest";

      const mistralRes = await fetch(
        "https://api.mistral.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mistralApiKey}`,
          },
          body: JSON.stringify({
            model: mistralModel,
            messages: [
              { role: "system", content: CASE_ANALYZER_PROMPT },
              { role: "user", content: userMessage },
            ],
            temperature: 0.4,
            max_tokens: 8192,
            response_format: { type: "json_object" },
          }),
        }
      );

      if (mistralRes.ok) {
        const data = await mistralRes.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          try {
            const cleaned = content.replace(/```json\n?|```\n?/g, "").trim();
            return NextResponse.json(JSON.parse(cleaned));
          } catch {
            console.error("Failed to parse Mistral response");
          }
        }
      }

      return NextResponse.json(generateDemoAnalysis(caseType, clientSide, court));
    }

    // Try multiple models in order (fallback on rate limit)
    const primaryModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const modelsToTry = [
      primaryModel,
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
    ].filter((m, i, arr) => arr.indexOf(m) === i); // deduplicate

    let lastError = "";

    for (const model of modelsToTry) {
      console.log(`Case Analyzer — trying Gemini model: ${model}`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${CASE_ANALYZER_PROMPT}\n\n---\n\n${userMessage}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 8192,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.status === 429) {
        lastError = `Rate limit hit for ${model}`;
        console.warn(lastError, "— trying next model...");
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      if (!response.ok) {
        lastError = await response.text();
        console.error(`Gemini API error (${model}):`, lastError);
        continue;
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        console.error(`Gemini (${model}) returned no content:`, JSON.stringify(data));
        continue;
      }

      try {
        // Clean any markdown code fences Gemini might add
        const cleaned = content.replace(/```json\n?|```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return NextResponse.json(parsed);
      } catch {
        console.error(`Failed to parse Gemini (${model}) response:`, content);
        continue;
      }
    }

    // All Gemini models failed — try Mistral as fallback
    const mistralKey = process.env.MISTRAL_API_KEY;
    if (mistralKey) {
      console.log("All Gemini models failed. Falling back to Mistral AI for case analysis...");

      const mistralModel = process.env.MISTRAL_MODEL || "mistral-small-latest";

      try {
        const mistralRes = await fetch(
          "https://api.mistral.ai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${mistralKey}`,
            },
            body: JSON.stringify({
              model: mistralModel,
              messages: [
                { role: "system", content: CASE_ANALYZER_PROMPT },
                { role: "user", content: userMessage },
              ],
              temperature: 0.4,
              max_tokens: 8192,
              response_format: { type: "json_object" },
            }),
          }
        );

        if (mistralRes.ok) {
          const mistralData = await mistralRes.json();
          const mistralContent =
            mistralData.choices?.[0]?.message?.content;
          if (mistralContent) {
            try {
              const cleaned = mistralContent
                .replace(/```json\n?|```\n?/g, "")
                .trim();
              const parsed = JSON.parse(cleaned);
              console.log(`Mistral (${mistralModel}) case analysis succeeded`);
              return NextResponse.json(parsed);
            } catch {
              console.error("Failed to parse Mistral response:", mistralContent);
            }
          }
        } else {
          const errText = await mistralRes.text();
          console.error("Mistral API error:", errText);
        }
      } catch (mistralErr) {
        console.error("Mistral fallback failed:", mistralErr);
      }
    }

    // All providers failed — return demo with a flag
    console.error("All AI providers failed. Last error:", lastError);
    const demo = generateDemoAnalysis(caseType, clientSide, court);
    return NextResponse.json({ ...demo, _isDemo: true, _error: "AI service is temporarily rate-limited. Showing sample analysis. Please wait a minute and try again." });
  } catch (error) {
    console.error("Case analyzer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateDemoAnalysis(
  caseType: string,
  clientSide: string,
  court: string
) {
  const side = clientSide === "petitioner" ? "Petitioner" : "Respondent";
  const otherSide = clientSide === "petitioner" ? "Respondent" : "Petitioner";

  return {
    caseSummary: `CASE SUMMARY
═══════════════════════════════════════

This is a ${caseType} matter pending before the ${court.replace("-", " ")} involving a dispute between the parties. Based on the case documents provided, the ${side} has initiated proceedings seeking relief against the ${otherSide}.

The case involves multiple factual and legal issues that require careful analysis under the applicable Indian statutes. The matter appears to be at the stage of arguments/evidence, and the ${side} seeks appropriate relief as per the applicable provisions of law.

The core dispute revolves around the alleged violation of statutory provisions, and the ${side} contends that the facts and law support their position. The ${otherSide} has contested the claims, raising preliminary objections and challenging the maintainability of the case.

The case has implications under multiple statutes and requires reference to several landmark judgments of the Supreme Court and various High Courts for proper adjudication.

Note: For a more detailed and case-specific analysis, please configure your OpenAI API key in the .env.local file. This demo provides a general framework of how the analysis would look.`,

    keyFacts: `KEY FACTS & TIMELINE
═══════════════════════════════════════

UNDISPUTED FACTS:
1. The parties are before this Hon'ble Court in a ${caseType} matter
2. The ${side} has filed the present case seeking relief under applicable provisions
3. Proper jurisdiction of this court has been established
4. Notice has been served on all parties

DISPUTED FACTS:
5. The exact sequence of events leading to the dispute remains contested
6. The ${otherSide} disputes the material facts alleged by the ${side}
7. Documentary evidence requires verification and cross-examination
8. The timeline of events as presented by both sides differs materially

CRITICAL OBSERVATIONS:
9. The limitation period must be verified for each cause of action
10. The locus standi of the ${side} appears to be established on prima facie examination
11. The factual matrix suggests multiple causes of action may be available
12. Witness testimony will be crucial for establishing the disputed facts

Note: With your actual case document, NyayGuru AI will extract precise facts, dates, names, and events from your case file.`,

    legalIssues: `LEGAL ISSUES IDENTIFIED
═══════════════════════════════════════

ISSUE 1: Whether this Hon'ble Court has the territorial and pecuniary jurisdiction to try and adjudicate the present matter?

ISSUE 2: Whether the ${side} has the locus standi to maintain the present ${caseType} proceedings?

ISSUE 3: Whether the cause of action as alleged by the ${side} is made out on the facts of the case?

ISSUE 4: Whether the suit/complaint/petition is within the period of limitation as prescribed under the Limitation Act, 1963?

ISSUE 5: Whether the ${side} is entitled to the reliefs as prayed for in the ${caseType === "criminal" ? "complaint" : "plaint/petition"}?

ISSUE 6: Whether the evidence on record, both documentary and oral, supports the case of the ${side}?

ISSUE 7: Whether there are any preliminary objections that go to the root of the matter and warrant dismissal at the threshold?

ISSUE 8: What is the appropriate relief, if any, that this Hon'ble Court may grant in the facts and circumstances of this case?

Each of these issues requires detailed analysis with reference to applicable statutes and precedents, which will be addressed in the arguments section below.`,

    applicableLaws: `APPLICABLE LAWS & SECTIONS
═══════════════════════════════════════

PRIMARY LEGISLATION:
${caseType === "criminal" ? `
• Bharatiya Nyaya Sanhita, 2023 (BNS) [replaced Indian Penal Code, 1860]
  - Relevant sections based on the nature of offence
• Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) [replaced CrPC, 1973]
  - Section 223 (Filing of charge sheet)
  - Section 230-232 (Trial procedure)
  - Section 480-484 (Appeals and revisions)
• Bharatiya Sakshya Adhiniyam, 2023 (BSA) [replaced Indian Evidence Act, 1872]
  - Section 39 (Relevance of facts)
  - Section 61-65 (Documentary evidence)` : `
• Code of Civil Procedure, 1908 (CPC)
  - Order VII Rule 1 (Plaint requirements)
  - Order XXXIX Rule 1 & 2 (Temporary injunctions)
  - Section 9 (Courts to try all civil suits)
  - Section 11 (Res judicata)
• Indian Contract Act, 1872
  - Section 10 (Valid contract essentials)
  - Section 73 (Compensation for breach)
• Specific Relief Act, 1963
  - Section 12-14 (Specific performance)
  - Section 36-42 (Injunctions)`}

PROCEDURAL LAW:
• Limitation Act, 1963
  - Article 137 / relevant article for the specific cause of action
• Constitution of India
  - Article 14 (Right to Equality)
  - Article 21 (Right to Life and Liberty)
  - Article 226/227 (High Court writ jurisdiction, if applicable)

RULES & REGULATIONS:
• Relevant State-specific rules and practice directions
• Court rules for the ${court.replace("-", " ")}
• Bar Council of India Rules (professional conduct)`,

    similarCases: `SIMILAR CASES & VERDICTS
═══════════════════════════════════════

1. STATE OF MAHARASHTRA v. TAPAS D. NEOGY (1999) 7 SCC 685
   Facts: Dispute involving interpretation of statutory provisions in a ${caseType} matter.
   Held: The Supreme Court established that the burden of proof lies on the party making the assertion, and courts must examine the totality of evidence.
   Applicability: Supports our ${side}'s contention regarding the standard of proof required.
   Favors: ${side} ✅

2. BALDEV SINGH v. STATE OF PUNJAB (1999) 6 SCC 172
   Facts: Similar procedural issues arose regarding maintainability and jurisdiction.
   Held: The Court held that technicalities should not override substantial justice, and parties must be given a fair hearing.
   Applicability: Can be cited to argue for a liberal interpretation of procedural requirements.
   Favors: ${side} ✅

3. A.R. ANTULAY v. R.S. NAYAK (1988) 2 SCC 602
   Facts: Constitutional bench examined the scope of judicial proceedings and fair trial principles.
   Held: Right to speedy trial is a fundamental right under Article 21. Undue delay can be grounds for relief.
   Applicability: If there has been any procedural delay, this strengthens our position.
   Favors: ${side} ✅

4. ASHOK KUMAR GUPTA v. STATE OF U.P. (1997) 5 SCC 201
   Facts: The court examined the duty of courts to ensure justice while following due process.
   Held: Courts have inherent power to do justice and should not be constrained by hyper-technical objections.
   Applicability: Supports our prayer for substantive justice over procedural technicalities.
   Favors: ${side} ✅

5. K.S. PUTTASWAMY v. UNION OF INDIA (2017) 10 SCC 1
   Facts: Landmark privacy case with implications for individual rights and state obligations.
   Held: Right to privacy is a fundamental right; proportionality and reasonableness must be tested.
   Applicability: If the case involves any privacy or fundamental rights aspects.
   Favors: Neutral ⚖️

Note: With your actual case details and OpenAI API configured, NyayGuru will find highly specific and directly relevant case law with precise citations.`,

    arguments: `ARGUMENTS FOR THE ${side.toUpperCase()}
═══════════════════════════════════════

ARGUMENT 1: MAINTAINABILITY & JURISDICTION
It is humbly submitted that the present ${caseType === "criminal" ? "complaint" : "suit/petition"} is maintainable before this Hon'ble Court. The cause of action has arisen within the territorial jurisdiction of this court, and the subject matter falls squarely within the pecuniary jurisdiction as prescribed by law.

ARGUMENT 2: PRIMA FACIE CASE ESTABLISHED
The ${side} has made out a strong prima facie case based on the documentary and oral evidence on record. The facts clearly demonstrate that the ${side} has a legitimate legal claim that warrants adjudication and relief by this Hon'ble Court.

ARGUMENT 3: STATUTORY COMPLIANCE
All procedural requirements under the applicable statutes have been duly complied with by the ${side}. The ${caseType === "criminal" ? "complaint" : "suit/petition"} has been filed within the prescribed limitation period, with proper court fees, and following due process.

ARGUMENT 4: BALANCE OF CONVENIENCE
The balance of convenience lies in favor of the ${side}. If relief is not granted, the ${side} will suffer irreparable harm and injury, whereas the ${otherSide} will not be prejudiced by the grant of appropriate relief.

ARGUMENT 5: SUPPORTING PRECEDENTS
Several authoritative pronouncements of the Supreme Court and High Courts support the case of the ${side}. As cited above, the ratio decidendi of these cases is directly applicable to the facts of the present case.

ARGUMENT 6: EQUITY AND GOOD CONSCIENCE
Even if there are any technical deficiencies (which are denied), the principles of equity, justice, and good conscience mandate that this Hon'ble Court should grant relief to prevent manifest injustice.

ARGUMENT 7: ${otherSide.toUpperCase()}'S CONDUCT
The conduct of the ${otherSide} throughout the proceedings demonstrates a pattern of delay, evasion, and lack of good faith. This Court may draw adverse inference from such conduct.

ARGUMENT 8: CONSTITUTIONAL PROTECTION
The ${side}'s rights under Articles 14, 19, and 21 of the Constitution of India are engaged in this matter. Any interpretation of the applicable law must be consistent with these fundamental rights.`,

    counterArguments: `ANTICIPATED COUNTER-ARGUMENTS & REBUTTALS
═══════════════════════════════════════

COUNTER-ARGUMENT 1: LIMITATION / DELAY
Likely Argument: The ${otherSide} may argue that the proceedings are barred by limitation or that there has been unreasonable delay.
Strength: Moderate ⚠️
Rebuttal: The limitation period must be computed from the date of knowledge/accrual of cause of action, not from the date of the initial event. Reliance is placed on Section 5 of the Limitation Act (if applicable) and the doctrine of continuing wrong. In Balakrishnan v. M.A. Krishnamurthy (1998) 7 SCC 123, the Supreme Court held that limitation begins when the right to sue first accrues.

COUNTER-ARGUMENT 2: LACK OF EVIDENCE
Likely Argument: The ${otherSide} may contend that the ${side} has failed to produce sufficient evidence.
Strength: Moderate ⚠️
Rebuttal: The evidentiary burden at this stage is only to establish a prima facie case, not to prove beyond reasonable doubt (in civil matters). The documentary evidence on record, coupled with the circumstances, creates a strong presumption in favor of the ${side}.

COUNTER-ARGUMENT 3: MAINTAINABILITY CHALLENGE
Likely Argument: The ${otherSide} may raise objections regarding maintainability or jurisdiction.
Strength: Weak ⚡
Rebuttal: As demonstrated in Argument 1, all jurisdictional requirements are satisfied. The Supreme Court in SBP & Co. v. Patel Engineering (2005) 8 SCC 618 held that jurisdictional questions should be decided on a prima facie basis.

COUNTER-ARGUMENT 4: ALTERNATIVE REMEDY
Likely Argument: The ${otherSide} may argue that the ${side} has an alternative and more efficacious remedy.
Strength: Moderate ⚠️
Rebuttal: The availability of an alternative remedy is not an absolute bar, especially where fundamental rights are involved. In Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1, the Supreme Court held that the existence of an alternative remedy does not bar jurisdiction when there is violation of fundamental rights.`,

    finalArgument: `FINAL ARGUMENT — READY TO PRESENT IN COURT
═══════════════════════════════════════

May it please this Hon'ble Court,

I appear on behalf of the ${side} in the present matter. At the outset, I submit that this is a case where the facts speak for themselves, and the law is squarely in favor of my client.

BRIEF FACTS:
The present ${caseType === "criminal" ? "complaint" : "suit/petition"} arises from a dispute between the parties, the facts of which have been set out in detail in the ${caseType === "criminal" ? "complaint" : "plaint/petition"}. Without burdening this Hon'ble Court with repetition, I wish to highlight the key facts that are central to the determination of this case.

ON MERITS:
Your Lordship, the case of the ${side} rests on three fundamental pillars:

First, the factual foundation is unimpeachable. The documentary evidence on record clearly establishes every material fact alleged by the ${side}. The ${otherSide} has not been able to rebut this evidence despite having had full opportunity to do so.

Second, the law is settled and clear on the issues before this Court. The applicable provisions, as I have detailed in my submissions, leave no room for ambiguity. The rights of the ${side} are protected under statute, and the ${otherSide}'s actions constitute a clear violation of these rights.

Third, the balance of justice demands intervention by this Hon'ble Court. If relief is not granted, the ${side} will continue to suffer irreparable harm, whereas the ${otherSide} will not be prejudiced by the grant of appropriate relief.

PRECEDENTS:
I place reliance on the following authoritative pronouncements which are directly on point: [Relevant cases as cited in the arguments above]. These decisions establish the legal principles that govern the present case and support the ${side}'s contentions in every respect.

ON THE ${otherSide.toUpperCase()}'s CONTENTIONS:
The objections raised by the learned counsel for the ${otherSide} are without merit and do not stand scrutiny. Each of their contentions has been addressed and rebutted in my detailed submissions.

PRAYER:
In light of the foregoing submissions, I most respectfully pray that this Hon'ble Court may be pleased to:
(a) Allow the present ${caseType === "criminal" ? "complaint/application" : "suit/petition"};
(b) Grant the reliefs as prayed for;
(c) Pass any other order as this Hon'ble Court deems fit and proper in the interests of justice.

I am obliged, Your Lordship.

═══════════════════════════════════════
Note: This is an AI-generated draft. Please customize with specific facts, exact citations, and your professional judgment before presenting in court.`,

    recommendation: `STRATEGIC RECOMMENDATION
═══════════════════════════════════════

CASE STRENGTH ASSESSMENT: MODERATE TO STRONG ⚖️
(Precise assessment requires actual case details with OpenAI API configured)

STRENGTHS:
✅ The legal framework appears to support the ${side}'s position
✅ Established precedents can be cited in support
✅ The procedural requirements appear to be met
✅ Multiple legal remedies are available

WEAKNESSES TO ADDRESS:
⚠️ Ensure all documentary evidence is properly verified and exhibited
⚠️ Limitation issues, if any, must be addressed proactively
⚠️ Witness preparation is critical for cross-examination
⚠️ The ${otherSide}'s counter-arguments need thorough preparation

RECOMMENDED STRATEGY:

1. EVIDENCE PREPARATION
   - Compile and organize all documentary evidence chronologically
   - Prepare an evidence matrix linking each fact to supporting documents
   - Identify and prepare witnesses for examination and cross-examination

2. PROCEDURAL STEPS
   - File all applications within prescribed timelines
   - Ensure all affidavits are properly verified and notarized
   - Consider filing interlocutory applications if interim relief is needed

3. SETTLEMENT CONSIDERATION
   - Evaluate whether mediation/settlement is in the client's interest
   - If the case is strong, litigation may yield better results
   - If there are evidentiary gaps, consider ADR mechanisms

4. TIMELINE EXPECTATIONS
   - District Court: 6-18 months for disposal
   - High Court: 12-36 months
   - Supreme Court: 24-60 months
   - These are estimates; actual timelines vary by court and case complexity

5. COST-BENEFIT ANALYSIS
   - Factor in litigation costs vs. potential recovery/relief
   - Consider the emotional and time cost to the client
   - Discuss realistic expectations with the client

IMMEDIATE ACTION ITEMS:
📌 Verify all limitation dates and ensure compliance
📌 Collect and notarize all supporting documents
📌 Prepare detailed list of witnesses with their statements
📌 Research latest case law developments in this area
📌 Draft and file necessary interlocutory applications

💡 PRO TIP: Configure your OpenAI API key in .env.local to get highly specific, case-tailored analysis with real case citations and detailed legal research.`,
  };
}
