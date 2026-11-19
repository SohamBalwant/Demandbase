import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType = "image/jpeg", roughNotes } = await req.json();

    let model = getGeminiModel("gemini-3.1-flash-lite");
    if (!model) {
      model = getGeminiModel("gemini-3.5-flash-lite");
    }

    if (!model) {
      // Mock fallback response for instant hackathon testing
      return NextResponse.json({
        title: roughNotes || "High-Utility Campus Equipment",
        description:
          "Well-maintained and fully functional item ready for campus sharing. Comes with essential accessories and handled with care.",
        category: "tools",
        condition: "good",
        suggestedPrice: 50,
        suggestedDeposit: 300,
        tips: "Make sure to take clear timestamped photos of the power cable and accessories before handoff.",
      });
    }

    const promptText = `You are an expert appraiser and listing assistant for DemandLend, a campus resource sharing platform.
The user wants to list an item to let other students borrow it.
${roughNotes ? `The user provided these rough notes: "${roughNotes}"` : ""}

Analyze the provided details and return a structured JSON response with:
- "title": Clean, professional, attractive listing title (e.g. "Bosch 550W Impact Drill with Bits Kit")
- "description": Helpful 2-3 sentence description emphasizing condition, included accessories, and common student use-cases
- "category": One of exactly: ["electronics", "tools", "sports", "kitchen", "books", "furniture", "clothing", "vehicles", "party_supplies", "musical_instruments", "other"]
- "condition": One of exactly: ["new", "like_new", "good", "fair", "poor"]
- "suggestedPrice": fair daily lending fee in INR (use 0 if typically shared for free among students)
- "suggestedDeposit": reasonable refundable deposit amount in INR (typically 3-5x the daily rate, or 0 if free)
- "tips": one quick inspection tip for documenting condition before lending

Respond strictly with valid JSON only, no markdown markdown fences.`;

    let parts: any[] = [{ text: promptText }];
    if (imageBase64) {
      parts = [
        {
          inlineData: {
            mimeType: mimeType,
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
          },
        },
        { text: promptText },
      ];
    }

    const result = await model.generateContent(parts);
    let rawText = result.response.text().trim();
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/```(json)?/g, "").trim();
    }

    const parsed = JSON.parse(rawText);
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("AI Describe error:", err);
    return NextResponse.json({
      title: "Campus Resource Item",
      description: "Clean and tested item ready for lending. Please check photos for condition details.",
      category: "other",
      condition: "good",
      suggestedPrice: 50,
      suggestedDeposit: 250,
      tips: "Document accessories and working power switch before handing over.",
    });
  }
}
