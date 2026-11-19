import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { Listing, CalendarDemand } from "@/types";

export async function POST(req: Request) {
  try {
    const { demands, listings } = await req.json();

    if (!demands || !listings) {
      return NextResponse.json({ matches: [] });
    }

    let model = getGeminiModel("gemini-3.1-flash-lite");
    if (!model) {
      model = getGeminiModel("gemini-3.5-flash-lite");
    }

    if (!model) {
      // Fallback simple category matcher
      const matches = [];
      for (const demand of demands.slice(0, 5)) {
        const found = listings.find((l: Listing) => l.category === demand.category);
        if (found) {
          matches.push({
            demandId: demand.id,
            listingId: found.id,
            confidence: 0.85,
            explanation: `Found ${found.title} matching "${demand.title}" in category ${demand.category}`,
          });
        }
      }
      return NextResponse.json({ matches });
    }

    const prompt = `You are the campus demand-supply matching engine for DemandLend.
Given these open borrower needs (demands):
${JSON.stringify(demands.map((d: CalendarDemand) => ({ id: d.id, title: d.title, description: d.description, category: d.category })))}

And these available item listings:
${JSON.stringify(listings.map((l: Listing) => ({ id: l.id, title: l.title, description: l.description, category: l.category })))}

Find genuine matches where an available listing fulfills an open demand.
Return a JSON array of matches:
[{"demandId": "...", "listingId": "...", "confidence": 0.0-1.0, "explanation": "Short 1-sentence reason why this listing fulfills this demand"}]
Only return matches with confidence >= 0.7.
Return strictly valid JSON array only.`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text().trim();
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/```(json)?/g, "").trim();
    }

    const matches = JSON.parse(rawText);
    return NextResponse.json({ matches });
  } catch (err: any) {
    console.error("Demand match error:", err);
    return NextResponse.json({ matches: [] });
  }
}
