import { NextRequest, NextResponse } from "next/server";

const CASE_LOOKUP_SYSTEM_PROMPT = `You are NyayGuru Case Lookup — an AI legal research tool specializing in Indian court cases. When given a case identifier (case name, citation, CNR number, case number, or any reference), you must find and return detailed information about that case.

You MUST return a JSON object with these exact keys:

{
  "found": true/false,
  "caseName": "Full case name (e.g., 'State of Maharashtra v. Tapas D. Neogy')",
  "citation": "Case citation (e.g., '(1999) 7 SCC 685' or 'AIR 2020 SC 1234')",
  "court": "Court name (e.g., 'Supreme Court of India', 'Bombay High Court')",
  "date": "Date of judgment (e.g., '15 March, 2020')",
  "bench": "Names of judges on the bench",
  "caseType": "criminal/civil/constitutional/family/property/consumer/labour/corporate/tax/other",
  "parties": "Petitioner vs Respondent details",
  "facts": "Detailed facts of the case (200-400 words). Include the background, sequence of events, and what led to the legal dispute.",
  "issues": "Legal issues framed by the court",
  "laws": "Applicable statutes and sections cited in the case",
  "arguments": "Key arguments made by both sides",
  "holding": "The court's decision/judgment/ratio decidendi",
  "significance": "Why this case is important — the legal principle it established",
  "fullText": "A comprehensive narrative of the entire case (500-1000 words) that includes all facts, arguments, and the judgment. This should be detailed enough to analyze in the Case Analyzer."
}

RULES:
- If you recognize the case, set "found" to true and fill ALL fields with accurate information
- If you cannot identify the case, set "found" to false and provide helpful suggestions in the "fullText" field
- Use real, accurate case details — do NOT fabricate citations or holdings
- For Indian cases, reference both old law (IPC, CrPC, Evidence Act) and new law (BNS, BNSS, BSA) where applicable
- Be thorough and detailed — lawyers need precise information
- Return ONLY valid JSON, no markdown`;

// Try Indian Kanoon API
async function tryIndianKanoonSearch(query: string, token: string): Promise<{ docId?: string; title?: string; snippet?: string; docs?: Array<{ tid: string; title: string; headline: string }> } | null> {
  try {
    const searchUrl = `https://api.indiankanoon.org/search/?formInput=${encodeURIComponent(query)}&pagenum=0`;
    const res = await fetch(searchUrl, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.error("Indian Kanoon search failed:", res.status);
      return null;
    }

    const data = await res.json();
    if (data.docs && data.docs.length > 0) {
      return {
        docId: data.docs[0].tid,
        title: data.docs[0].title,
        snippet: data.docs[0].headline,
        docs: data.docs.slice(0, 5),
      };
    }
    return null;
  } catch (err) {
    console.error("Indian Kanoon search error:", err);
    return null;
  }
}

async function tryIndianKanoonDoc(docId: string, token: string): Promise<string | null> {
  try {
    const docUrl = `https://api.indiankanoon.org/doc/${docId}/`;
    const res = await fetch(docUrl, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.error("Indian Kanoon doc fetch failed:", res.status);
      return null;
    }

    const data = await res.json();
    return data.doc || null;
  } catch (err) {
    console.error("Indian Kanoon doc error:", err);
    return null;
  }
}

// AI-powered case lookup using Gemini/Mistral
async function aiCaseLookup(query: string): Promise<Record<string, unknown> | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const mistralKey = process.env.MISTRAL_API_KEY;

  const userMessage = `Find detailed information about this Indian court case:

"${query}"

This could be:
- A case name (e.g., "Kesavananda Bharati vs State of Kerala")
- A case citation (e.g., "(2017) 10 SCC 1")
- A case/CNR number (e.g., "MHAU019999992015" or "Criminal Appeal No. 123/2020")
- A general description (e.g., "the triple talaq case" or "Aadhaar privacy case")

Search your knowledge and provide comprehensive details about this case.`;

  // Try Gemini models first
  if (geminiKey) {
    const primaryModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const modelsToTry = [primaryModel, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"]
      .filter((m, i, arr) => arr.indexOf(m) === i);

    for (const model of modelsToTry) {
      console.log(`Case Lookup — trying Gemini model: ${model}`);
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${CASE_LOOKUP_SYSTEM_PROMPT}\n\n---\n\n${userMessage}` }],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (response.status === 429) {
          console.warn(`Rate limit hit for ${model} — trying next...`);
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }

        if (!response.ok) continue;

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
          const cleaned = content.replace(/```json\n?|```\n?/g, "").trim();
          return JSON.parse(cleaned);
        }
      } catch (err) {
        console.error(`Gemini ${model} case lookup error:`, err);
        continue;
      }
    }
  }

  // Fallback to Mistral
  if (mistralKey) {
    console.log("Falling back to Mistral for case lookup...");
    const mistralModel = process.env.MISTRAL_MODEL || "mistral-small-latest";

    try {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mistralKey}`,
        },
        body: JSON.stringify({
          model: mistralModel,
          messages: [
            { role: "system", content: CASE_LOOKUP_SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          temperature: 0.3,
          max_tokens: 8192,
          response_format: { type: "json_object" },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const cleaned = content.replace(/```json\n?|```\n?/g, "").trim();
          return JSON.parse(cleaned);
        }
      }
    } catch (err) {
      console.error("Mistral case lookup error:", err);
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, source } = body;

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: "Case ID or search query is required" },
        { status: 400 }
      );
    }

    const ikToken = process.env.INDIAN_KANOON_TOKEN;

    // Strategy 1: If Indian Kanoon token available and user wants IK or auto
    if (ikToken && (source === "indiankanoon" || source === "auto")) {
      console.log("Trying Indian Kanoon API...");

      // Check if query looks like a numeric doc ID
      const isDocId = /^\d+$/.test(query.trim());

      if (isDocId) {
        // Direct document fetch
        const doc = await tryIndianKanoonDoc(query.trim(), ikToken);
        if (doc) {
          return NextResponse.json({
            source: "indiankanoon",
            found: true,
            caseName: "Document from Indian Kanoon",
            docId: query.trim(),
            fullText: doc.replace(/<[^>]*>/g, ""), // Strip HTML tags
            _raw: doc,
          });
        }
      } else {
        // Search by case name/citation
        const searchResult = await tryIndianKanoonSearch(query.trim(), ikToken);
        if (searchResult && searchResult.docId) {
          // Fetch the full document
          const doc = await tryIndianKanoonDoc(searchResult.docId, ikToken);
          const plainText = doc ? doc.replace(/<[^>]*>/g, "") : searchResult.snippet?.replace(/<[^>]*>/g, "") || "";

          return NextResponse.json({
            source: "indiankanoon",
            found: true,
            caseName: searchResult.title?.replace(/<[^>]*>/g, "") || query,
            docId: searchResult.docId,
            fullText: plainText,
            searchResults: searchResult.docs?.map((d) => ({
              id: d.tid,
              title: d.title?.replace(/<[^>]*>/g, ""),
              snippet: d.headline?.replace(/<[^>]*>/g, ""),
            })),
          });
        }
      }

      // If IK search didn't find anything, fall through to AI
      if (source === "indiankanoon") {
        return NextResponse.json({
          source: "indiankanoon",
          found: false,
          error: "Case not found on Indian Kanoon. Try using the AI Search instead.",
        });
      }
    }

    // Strategy 2: AI-powered case lookup (works without any external API)
    console.log("Using AI-powered case lookup...");
    const aiResult = await aiCaseLookup(query.trim());

    if (aiResult) {
      return NextResponse.json({
        source: "ai",
        ...aiResult,
      });
    }

    // All methods failed
    return NextResponse.json({
      found: false,
      source: "none",
      error: "Could not find case details. Please try with a different case name, citation, or case number.",
    });
  } catch (error) {
    console.error("Case lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
