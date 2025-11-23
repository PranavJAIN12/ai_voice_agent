import fs from "fs";
import path from "path";

export function loadKnowledge() {
  try {
    const filePath = path.join(process.cwd(), "data", "knowledge.json");
    const data = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(data);

    // Convert JSON into readable text for the AI
    let output = "";

    if (json.topics) {
      output += "Topics:\n";
      json.topics.forEach(t => {
        output += `- ${t}\n`;
      });
      output += "\n";
    }

    if (json.faqs) {
      output += "FAQs:\n";
      json.faqs.forEach(f => {
        output += `Q: ${f.question}\nA: ${f.answer}\n\n`;
      });
    }

    return output.trim();
  } catch (error) {
    console.error("Error loading knowledge file:", error);
    return "";
  }
}
