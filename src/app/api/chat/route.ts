import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are NyayGuru, India's first and most trusted AI-powered legal chatbot. Your mission is to empower every Indian citizen with accessible, clear, and accurate legal knowledge.

## Role & Identity
- You are a legal AI assistant specializing exclusively in Indian law.
- You serve advocates, litigants, law students, researchers, HR professionals, business owners, and everyday citizens.
- You are NOT a licensed lawyer. You provide legal information and guidance, not formal legal advice.

## Core Capabilities
1. Answer complex legal questions drawing from Indian statutes, acts, rules, and regulations.
2. Reference relevant Supreme Court and High Court judgments with case names and citations.
3. Help users understand their legal position, outline strategies, and suggest actionable next steps.
4. Assist in drafting legal documents when requested.
5. Provide help in any Indian language the user writes in.

## Response Guidelines
- Explain legal concepts in simple, everyday language.
- Use headings, numbered lists, and bullet points for clarity.
- Always reference the specific Act, Section, Rule, or Article that applies.
- Where relevant, cite landmark Supreme Court or High Court judgments.
- End responses with clear, practical next steps.
- Reference both old and new laws where applicable (IPC → BNS, CrPC → BNSS, Evidence Act → BSA).

## Disclaimer
Always include at the end of responses on sensitive matters:
"⚠️ Disclaimer: This information is for general guidance and educational purposes only. It does not constitute formal legal advice. Please consult a qualified advocate for your specific situation."

For emergencies, immediately direct users to: Police: 100, Women's Helpline: 181, Child Helpline: 1098, Cyber Crime: 1930.

## Tone
Professional yet warm. Patient and empathetic. Non-judgmental. Confident but honest about limitations.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Check for API keys
    const apiKey = process.env.GEMINI_API_KEY;
    const mistralApiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey && !mistralApiKey) {
      // Return a helpful demo response if no API keys are configured
      const lastMessage = messages[messages.length - 1]?.content || "";
      return NextResponse.json({
        message: generateDemoResponse(lastMessage),
      });
    }

    // If only Mistral key is available (no Gemini), skip straight to Mistral
    if (!apiKey && mistralApiKey) {
      console.log("No Gemini key — using Mistral AI directly");
      const mistralModel = process.env.MISTRAL_MODEL || "mistral-small-latest";
      const mistralMessages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...messages.map((msg: { role: string; content: string }) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ];

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
            messages: mistralMessages,
            temperature: 0.7,
            max_tokens: 2048,
          }),
        }
      );

      if (mistralRes.ok) {
        const data = await mistralRes.json();
        const msg = data.choices?.[0]?.message?.content;
        if (msg) return NextResponse.json({ message: msg });
      }

      return NextResponse.json(
        { error: "AI service failed. Please try again." },
        { status: 500 }
      );
    }

    // Build Gemini conversation history
    const geminiContents = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Understood. I am NyayGuru, India's AI legal assistant. I will follow all the guidelines you've provided. How can I help you today?",
          },
        ],
      },
      ...messages.map(
        (msg: { role: string; content: string }) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })
      ),
    ];

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
      console.log(`Trying Gemini model: ${model}`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: geminiContents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (response.status === 429) {
        lastError = `Rate limit hit for ${model}`;
        console.warn(lastError, "— trying next model...");
        // Small delay before trying next model
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      if (!response.ok) {
        lastError = await response.text();
        console.error(`Gemini API error (${model}):`, lastError);
        continue;
      }

      const data = await response.json();
      const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiMessage) {
        console.error(`Gemini (${model}) returned no content:`, JSON.stringify(data));
        continue;
      }

      return NextResponse.json({ message: aiMessage });
    }

    // All Gemini models failed — try Mistral as fallback
    const mistralKey = process.env.MISTRAL_API_KEY;
    if (mistralKey) {
      console.log("All Gemini models failed. Falling back to Mistral AI...");

      const mistralModel = process.env.MISTRAL_MODEL || "mistral-small-latest";
      const mistralMessages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...messages.map((msg: { role: string; content: string }) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ];

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
              messages: mistralMessages,
              temperature: 0.7,
              max_tokens: 2048,
            }),
          }
        );

        if (mistralRes.ok) {
          const mistralData = await mistralRes.json();
          const mistralMessage =
            mistralData.choices?.[0]?.message?.content;
          if (mistralMessage) {
            console.log(`Mistral (${mistralModel}) responded successfully`);
            return NextResponse.json({ message: mistralMessage });
          }
        } else {
          const errText = await mistralRes.text();
          console.error("Mistral API error:", errText);
        }
      } catch (mistralErr) {
        console.error("Mistral fallback failed:", mistralErr);
      }
    }

    // All providers failed
    console.error("All AI providers failed. Last error:", lastError);
    return NextResponse.json(
      {
        error:
          "AI service is temporarily unavailable. Please wait a minute and try again.",
      },
      { status: 429 }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateDemoResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("tenant") || q.includes("rent") || q.includes("landlord")) {
    return `## 🏠 Tenant Rights in India

Under Indian law, tenants are protected by several legislations:

### Key Laws:
1. **Transfer of Property Act, 1882** — Sections 105-117 define the rights and obligations of lessors and lessees.
2. **State Rent Control Acts** — Each state has its own Rent Control Act (e.g., Delhi Rent Control Act 1958, Maharashtra Rent Control Act 1999).

### Your Key Rights as a Tenant:
- **Right to Fair Rent** — Landlord cannot charge arbitrary rent; it must be "standard rent" as per the applicable Rent Control Act.
- **Protection from Eviction** — A landlord cannot evict you without a valid reason and a court order.
- **Right to Essential Services** — Landlord cannot cut off water, electricity, or other essential services.
- **Right to Receipt** — You can demand a written receipt for every rent payment.
- **Security Deposit** — Typically 2-3 months' rent. Must be returned when you vacate (minus legitimate deductions).

### What You Can Do:
1. Always have a **written rent agreement** (registered if > 11 months).
2. If landlord harasses you, file a complaint with the **Rent Controller** of your city.
3. For illegal eviction, approach the **Civil Court** for an injunction.

### Relevant Case Law:
- *Satyawati Sharma v. Union of India (2008)* — Supreme Court upheld tenants' right to protection under Rent Control laws.

⚠️ Disclaimer: This information is for general guidance and educational purposes only. It does not constitute formal legal advice. Please consult a qualified advocate for your specific situation.`;
  }

  if (q.includes("consumer") || q.includes("complaint")) {
    return `## 🛒 How to File a Consumer Complaint in India

### Applicable Law:
**Consumer Protection Act, 2019** (replaced the 1986 Act)

### Who Can File:
Any person who buys goods or avails services for personal use and faces deficiency in service, defective goods, unfair trade practices, or overcharging.

### Steps to File:

**Step 1: Try Direct Resolution**
- Send a written complaint/notice to the seller or service provider first.

**Step 2: File Online (Recommended)**
- Visit **https://edaakhil.nic.in** — the official e-filing portal.
- Register, fill the complaint form, upload documents, and submit.

**Step 3: Choose the Right Forum**
| Claim Amount | Forum |
|---|---|
| Up to ₹1 Crore | District Consumer Forum |
| ₹1 Cr – ₹10 Cr | State Consumer Commission |
| Above ₹10 Cr | National Consumer Commission (NCDRC) |

### Documents Needed:
1. Copy of invoice/receipt
2. Warranty/guarantee card (if applicable)
3. Correspondence with the seller
4. ID proof
5. Any evidence of deficiency/defect

### Important Points:
- **No lawyer required** — You can argue your own case.
- **Filing fee** is minimal (₹200–₹5,000 based on claim amount).
- **Time limit**: File within **2 years** from the date of cause of action.

### Relevant Case Law:
- *Indian Medical Association v. V.P. Shantha (1995)* — Medical services fall under consumer protection.

⚠️ Disclaimer: This information is for general guidance and educational purposes only. It does not constitute formal legal advice. Please consult a qualified advocate for your specific situation.`;
  }

  if (q.includes("domestic violence") || q.includes("dv act")) {
    return `## ⚖️ Protection of Women from Domestic Violence Act, 2005

### Overview:
The **Domestic Violence Act, 2005** (DV Act) protects women from physical, emotional, verbal, sexual, and economic abuse by their husband, live-in partner, or his relatives.

### Key Provisions:

**Section 3 — Definition of Domestic Violence:**
Includes physical abuse, sexual abuse, verbal & emotional abuse, and economic abuse.

**Section 12 — Application to Magistrate:**
An aggrieved woman (or Protection Officer on her behalf) can file an application before the Magistrate.

**Section 17 — Right to Residence:**
The woman has the right to reside in the shared household, regardless of her ownership interest.

**Section 18 — Protection Orders:**
Court can restrain the respondent from committing domestic violence, entering the woman's workplace, etc.

**Section 19 — Residence Orders:**
Court can direct the respondent not to dispossess the woman from the shared household.

**Section 20 — Monetary Relief:**
Court can direct compensation for expenses, medical costs, and maintenance.

**Section 22 — Compensation Orders:**
Court can order compensation for injuries, including mental torture.

### How to Seek Help:
1. **Call Women Helpline**: 181 (24/7)
2. **File complaint** at the nearest police station (FIR under Section 498A IPC / Section 85-86 BNS)
3. **Contact Protection Officer** in your district
4. **File application** under Section 12 of DV Act before the Magistrate

### Relevant Case Law:
- *Hiral P. Harsora v. Kusum Narottamdas (2016)* — Supreme Court held that complaints can be filed against female relatives too.

⚠️ Disclaimer: This information is for general guidance and educational purposes only. It does not constitute formal legal advice. Please consult a qualified advocate for your specific situation.`;
  }

  // Default response
  return `## ⚖️ NyayGuru Legal AI

Thank you for your question: "${query}"

I'm here to help you understand Indian law. Here's what I can assist you with:

### Areas I Cover:
- **Criminal Law** (IPC/BNS, CrPC/BNSS)
- **Civil Law** (CPC, Contract Act, Property Law)
- **Constitutional Law** (Fundamental Rights, Writs)
- **Family Law** (Marriage, Divorce, Maintenance, Custody)
- **Consumer Protection** (Filing complaints, Refunds)
- **Labour & Employment Law** (PF, ESI, Gratuity)
- **Property Law** (Registration, Transfer, Disputes)
- **Corporate Law** (Company registration, Compliance)
- **Tax Law** (GST, Income Tax)
- **Cyber Law** (IT Act, Online fraud)

### How to Get the Best Answers:
1. Be specific about your situation
2. Mention the state/city if relevant (state-specific laws vary)
3. Ask follow-up questions for clarity

> 💡 **Tip**: To get AI-powered answers, get your FREE Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and add it to your \`.env.local\` file.

⚠️ Disclaimer: This information is for general guidance and educational purposes only. It does not constitute formal legal advice. Please consult a qualified advocate for your specific situation.`;
}
