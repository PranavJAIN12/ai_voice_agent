import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY,
});

export async function POST(req) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText) {
      return Response.json(
        { error: "Missing resume text" },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" }, // 🔒 GUARANTEED JSON
      messages: [
        {
          role: "system",
          content:
            `You are an expert ATS (Applicant Tracking System) analyzer.  
Analyze the following resume and provide a comprehensive ATS compatibility assessment.  

Evaluation Criteria:  
1. Format compatibility (simple formatting, readable fonts, proper sections)  
2. Keyword optimization (role- and industry-relevant terms, skills, technologies, or experiences)  
3. Structure and organization (clear sections, bullet points, dates)  
4. Content quality (achievements, quantifiable results, clarity)  
5. Contact information and professional summary  

Important Instructions:  
- Respond ONLY in valid JSON format (no markdown, no extra text, no explanations).  
- Follow the exact key names below.  
- Do not include comments, escape characters, or additional fields.  
- Ensure ats_score is an integer between 0 and 100.

Output JSON format:
{
  "ats_score": 85,
  "suggestions": [
    "Add measurable achievements to strengthen impact",
    "Use consistent date formatting across all roles",
    "Include more industry-specific keywords to align with job descriptions",
    "Consider adding a professional summary at the top"
  ],
  "overall_feedback": "The resume is strong in formatting and readability but would benefit from more quantifiable results and role-specific keywords."
}
`,
        },
        {
          role: "user",
          content: `Resume to analyze:\n${resumeText}`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content);

    return Response.json({
      ats_score: Number(parsed.ats_score) || 0,
      suggestions: parsed.suggestions || [],
      overall_feedback: parsed.overall_feedback || "",
    });
  } catch (error) {
    console.error("OpenAI ATS error:", error);
    return Response.json(
      { error: error.message || "ATS check failed" },
      { status: 500 }
    );
  }
}
