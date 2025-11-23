import { NextResponse } from "next/server";
import { loadKnowledge } from "@/utils/loadKnowledge";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";

export async function POST(req) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    // Load context / knowledge
    const knowledge = await loadKnowledge(); // <-- FIXED async

    // Request payload
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
             text: `
You are CoachLume's AI assistant.

Instructions:
- Use the provided context ONLY for CoachLume-related questions.
- For general questions NOT related to CoachLume, answer using your full AI knowledge.
- If the user asks something specifically about CoachLume AND the answer is not in context, then say: "I'm not sure, please check the CoachLume dashboard."

Context:
${knowledge}

User question: ${question}

Answer naturally and conversationally.
`,
            }
          ]
        }
      ]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    // Extract text safely
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.map(p => p.text).join(" ") ||
      data?.candidates?.[0]?.text ||
      "Sorry, I couldn't generate an answer.";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { answer: "Sorry, something went wrong on the server." },
      { status: 500 }
    );
  }
}
