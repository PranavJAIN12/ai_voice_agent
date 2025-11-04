import fs from "fs";
import path from "path";

export function loadKnowledge() {
  const dir = path.join(process.cwd(), "data");
  const files = fs.readdirSync(dir);

  let allText = "";
  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), "utf8");
    allText += `\n\n# ${file.replace(".txt", "")}\n${content}`;
  }
  return allText;
}
