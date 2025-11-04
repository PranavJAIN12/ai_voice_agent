import fs from "fs";
import path from "path";

export function loadKnowledge() {
  try {
    const filePath = path.join(process.cwd(), "data", "knowledge.txt");
    const data = fs.readFileSync(filePath, "utf-8");
    return data;
  } catch (error) {
    console.error("Error loading knowledge file:", error);
    return "";
  }
}
