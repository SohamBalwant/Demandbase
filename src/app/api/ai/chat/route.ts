import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { message, userName } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    let model = getGeminiModel("gemini-3.1-flash-lite");
    if (!model) {
      model = getGeminiModel("gemini-3.5-flash-lite");
    }

    if (!model) {
      // Fallback response when key is not active
      return NextResponse.json({
        reply: `Hi ${userName}! DemandLend allows students and campus residents to share physical items (tools, projectors, cameras, study tables, kitchen appliances). You can list items for free or daily rent, document item conditions with photos before and after handoff, track security deposit escrow statuses, and leave 1-5 star reputation reviews!`,
      });
    }

    const prompt = `You are the friendly, helpful AI concierge for "DemandLend", an on-campus peer-to-peer resource sharing platform.
Platform details:
- Students can list items they rarely use (power tools, projectors, sports gear, cameras, study tables, etc.) for FREE or for a daily price (in INR ₹).
- Borrowers send requests with desired borrow dates and a message.
- Once accepted, a real-time chat thread opens to coordinate handoffs (meet in middle, specific location, or courier).
- Condition Documentation: Lenders and borrowers document timestamped photos of the item's condition before handoff and after return to resolve any condition questions.
- Security Deposit: Tracked in escrow status (held -> returned or claimed).
- Public Demand Calendar: If a student needs an item not currently listed, they can post their need on the public calendar. Other students can browse and fulfill it!
- Private Community Circles: Specific hostels or college departments can form private groups with 6-char join codes.
- Reputation: Both parties leave 1-5 star ratings and reviews after each return.

User's Name: ${userName || "Campus Member"}
User Question: "${message}"

Give a concise, upbeat, helpful response in 2-4 sentences max. Highlight practical safety tips or relevant platform features where appropriate.`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("Gemini chat error:", err);
    return NextResponse.json({
      reply:
        "DemandLend helps you save money by borrowing campus gear instead of buying it! You can list items for free, document condition photos for peace of mind, and coordinate safe handoffs directly via chat.",
    });
  }
}
