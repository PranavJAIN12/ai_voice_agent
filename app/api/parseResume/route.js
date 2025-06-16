// app/api/par/route.js
import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";

// Disable Next.js default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const form = formidable({ keepExtensions: true });

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return resolve(NextResponse.json({ error: "Form parsing failed" }, { status: 500 }));
      }

      const file = files.resume;
      if (!file) {
        return resolve(NextResponse.json({ error: "No file uploaded" }, { status: 400 }));
      }

      try {
        const buffer = fs.readFileSync(file.filepath);
        const parsed = await pdfParse(buffer);
        return resolve(NextResponse.json({ text: parsed.text }));
      } catch (error) {
        console.error("PDF parsing failed:", error);
        return resolve(NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 }));
      }
    });
  });
}
