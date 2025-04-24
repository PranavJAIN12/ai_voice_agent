// service/globalSer.js
import OpenAI from "openai";
import { ExpertsList } from "./options";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_KEY,
  dangerouslyAllowBrowser: true
});

export const AIModel = async (topic, expertType, msg) => {
    console.log("Inside AIModel with topic:", topic, "expert type:", expertType);
    
    if (!topic || !expertType || !msg) {
        console.error("Missing required parameter(s):", { topic, expertType, msg });
        throw new Error("Missing required parameters");
    }
    
    // Find the expert type from ExpertsList
    const option = ExpertsList.find((item) => item.name === expertType);
    
    if (!option) {
        console.error("No expert type found:", expertType);
        throw new Error("No expert type found");
    }
  
    const filledPrompt = option.prompt.replace("{user_topic}", topic);
    console.log("Filled prompt:", filledPrompt);
  
    try {
        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-exp:free",
            messages: [
                { role: "system", content: filledPrompt },
                { role: "user", content: msg }
            ],
        });
      
        console.log("AI completion result:", completion);
        return completion.choices[0].message;
    } catch (error) {
        console.error("OpenAI API error:", error);
        throw error;
    }
};