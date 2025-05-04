// // service/globalSer.js
// import OpenAI from "openai";
// import { ExpertsList } from "./options";

// const openai = new OpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: process.env.NEXT_PUBLIC_OPENROUTER_KEY,
//   dangerouslyAllowBrowser: true
// });

// export const AIModel = async (topic, expertType, msg) => {
//     console.log("Inside AIModel with topic:", topic, "expert type:", expertType);
    
//     if (!topic || !expertType || !msg) {
//         console.error("Missing required parameter(s):", { topic, expertType, msg });
//         throw new Error("Missing required parameters");
//     }
    
//     // Find the expert type from ExpertsList
//     const option = ExpertsList.find((item) => item.name === expertType);
    
//     if (!option) {
//         console.error("No expert type found:", expertType);
//         throw new Error("No expert type found");
//     }
  
//     const filledPrompt = option.prompt.replace("{user_topic}", topic);
//     console.log("Filled prompt:", filledPrompt);
  
//     try {
//         const completion = await openai.chat.completions.create({
//             model: "google/gemini-2.0-flash-exp:free",
//             messages: [
//                 { role: "system", content: filledPrompt },
//                 { role: "user", content: msg }
//             ],
//         });
      
//         console.log("AI completion result:", completion);
//         return completion.choices[0].message;
//     } catch (error) {
//         console.error("OpenAI API error:", error);
//         throw error;
//     }
// };


// export const AIModelToGenerateFeedbackAndNotes = async ( expertType, conversation) => {
//     console.log("Inside AIModel with topic:", "expert type:", expertType);
    
//     if (!topic || !expertType || !msg) {
//         console.error("Missing required parameter(s):", {  expertType, msg });
//         throw new Error("Missing required parameters");
//     }
    
//     // Find the expert type from ExpertsList
//     const option = ExpertsList.find((item) => item.name === expertType);
    
//     if (!option) {
//         console.error("No expert type found:", expertType);
//         throw new Error("No expert type found");
//     }
  
//     const filledPrompt = (option.summeryPrompt)
//     console.log("Filled prompt:", filledPrompt);
  
//     try {
//         const completion = await openai.chat.completions.create({
//             model: "google/gemini-2.0-flash-exp:free",
//             messages: [
//                 { role: "system", content: filledPrompt },
//                 { role: "user", content: msg }
//             ],
//         });
      
//         console.log("AI completion result:", completion);
//         return completion.choices[0].message;
//     } catch (error) {
//         console.error("OpenAI API error:", error);
//         throw error;
//     }
// };




// service/globalSer.js
import { ExpertsList } from "./options";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_KEY;
const GEMINI_MODEL = "gemini-2.0-flash"; // You can change this to "gemini-2.0-flash" if needed

// General purpose Gemini AI model
export const AIModel = async (topic, expertType, msg) => {
    console.log("Inside AIModel with topic:", topic, "expert type:", expertType);

    if (!topic || !expertType || !msg) {
        console.error("Missing required parameter(s):", { topic, expertType, msg });
        throw new Error("Missing required parameters");
    }

    const option = ExpertsList.find((item) => item.name === expertType);
    if (!option) {
        console.error("No expert type found:", expertType);
        throw new Error("No expert type found");
    }

    const filledPrompt = option.prompt.replace("{user_topic}", topic);
    console.log("Filled prompt:", filledPrompt);

    const payload = JSON.stringify({
        contents: [
            {
                parts: [
                    { text: filledPrompt },
                    { text: msg }
                ]
            }
        ]
    });

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: payload
        });

        const data = await response.json();
        console.log("Gemini API result:", data);

        return data.candidates?.[0]?.content || "No response from Gemini";
    } catch (error) {
        console.error("Gemini API error:", error);
        throw error;
    }
};
// Generate feedback and notes from conversation
export const AIModelToGenerateFeedbackAndNotes = async (expertType, messages) => {
    console.log("Inside AIModelToGenerateFeedbackAndNotes with expert type:", expertType);

    if (!expertType || !messages || !Array.isArray(messages)) {
        console.error("Missing or invalid parameter(s):", { expertType, messages });
        throw new Error("Missing or invalid parameters");
    }

    const option = ExpertsList.find((item) => item.name === expertType);
    if (!option) {
        console.error("No expert type found:", expertType);
        throw new Error("No expert type found");
    }

    // Format the conversation messages properly
    const formattedConversation = messages.map(msg => {
        const speaker = msg.isAI ? "Expert" : "User";
        return `${speaker}: ${msg.text}`;
    }).join('\n\n');

    const filledPrompt = `${option.summaryPrompt}

CONVERSATION TRANSCRIPT:
${formattedConversation}

Please provide constructive feedback on this conversation based on the above context.`;

    console.log("Prepared prompt for feedback generation");

    const payload = JSON.stringify({
        contents: [
            {
                parts: [
                    { text: filledPrompt }
                ]
            }
        ]
    });

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: payload
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Feedback generated successfully");

        // Handle the response structure properly
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
            return data.candidates[0].content;
        } else {
            console.error("Unexpected API response structure:", data);
            return { text: "Could not generate feedback. Please try again." };
        }
    } catch (error) {
        console.error("Error generating feedback:", error);
        throw error;
    }
};