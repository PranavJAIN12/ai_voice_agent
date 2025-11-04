// import { loadKnowledge } from "@/app/utils/embeddings";
import { loadKnowledge } from "@/utils/loadKnowledge";
import { NextResponse } from "next/server";
// import { loadKnowledge } from "@/utils/embeddings";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_KEY;
const GEMINI_MODEL = "gemini-2.0-flash"; // You can change this to "gemini-2.0-flash" if needed

export async function POST(req) {
  const { question } = await req.json();
  const knowledge = loadKnowledge();

  // Prepare payload for Gemini
  const payload = JSON.stringify({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
You are CoachLume's official bot website. Use the provided context to answer accurately.

Context:
${knowledge}

User question: ${question}

Rules:
- If the answer isn't in context, say "I'm not sure, please check the CoachLume dashboard."
- Reply clearly and conversationally.
`,
          },
        ],
      },
    ],
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    }
  );

  const data = await response.json();
  const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn’t generate an answer.";

  return NextResponse.json({ answer });
}
