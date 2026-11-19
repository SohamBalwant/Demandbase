import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { Listing } from "@/types";

export async function POST(req: Request) {
  try {
    const { query, listings } = await req.json();

    if (!query || !listings || !Array.isArray(listings)) {
      return NextResponse.json({ results: [] });
    }

    let model = getGeminiModel("gemini-3.1-flash-lite");
    if (!model) {
      model = getGeminiModel("gemini-3.5-flash-lite");
    }

    // Clean simplified listings data for the prompt
    const compactListings = listings.map((l: Listing) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      category: l.category,
      price: l.price,
    }));

    if (!model) {
      // Intelligent fallback search (category + keyword matching)
      const q = query.toLowerCase();
      const scored = compactListings
        .map((item) => {
          let score = 0;
          let reason = "Keyword match";
          const text = `${item.title} ${item.description} ${item.category}`.toLowerCase();
          if (text.includes(q)) {
            score = 0.9;
            reason = "Direct match in title or description";
          } else {
            const terms = q.split(" ").filter(Boolean);
            const matches = terms.filter((t: string) => text.includes(t)).length;
            if (matches > 0) {
              score = 0.4 + (matches / terms.length) * 0.4;
              reason = `Matched relevant words (${matches}/${terms.length})`;
            }
          }
          return { id: item.id, relevance: score, reason };
        })
        .filter((r) => r.relevance > 0.3)
        .sort((a, b) => b.relevance - a.relevance);

      return NextResponse.json({ results: scored });
    }

    const prompt = `You are the semantic search engine for DemandLend, a campus resource sharing platform.
Search Query: "${query}"

Here are the available item listings:
${JSON.stringify(compactListings)}

Your task:
Analyze the user's intent. For example:
- "smoothies" -> blenders, mixer grinders, food processors
- "hang painting" -> drills, hammers, screws, ladders
- "movie night" -> projectors, sound systems, popcorn makers
- "badminton or sport" -> rackets, shuttlecocks, sports shoes

Rank listings by semantic relevance. Return a JSON array of objects with:
- "id": listing ID string
- "relevance": float from 0.0 to 1.0 (only include items with relevance >= 0.35)
- "reason": concise 5-10 word reason explaining why this item satisfies the query

Respond strictly in valid JSON format only, with no markdown code fences, e.g.:
[{"id": "item-1", "relevance": 0.95, "reason": "Power drill includes bits to hang frames"}]`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text().trim();
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/```(json)?/g, "").trim();
    }

    let parsed = [];
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = [];
    }

    return NextResponse.json({ results: parsed });
  } catch (err: any) {
    console.error("AI Search API error:", err);
    return NextResponse.json({ results: [] });
  }
}
