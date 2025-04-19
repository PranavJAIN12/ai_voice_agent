import { NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";

export async function GET() {
  try {
    // Make sure the API key is properly set in your .env file
    if (!process.env.ASSEMBLYAI_API_KEY) {
      console.error("AssemblyAI API key not found in environment variables");
      return NextResponse.json(
        { error: "API key not configured" }, 
        { status: 500 }
      );
    }

    // Initialize the client with the correct API key name
    const client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY,
    });
    
    // Create the temporary token
    const token = await client.realtime.createTemporaryToken();
    
    return NextResponse.json(token);
  } catch (error) {
    console.error("Error generating AssemblyAI token:", error);
    return NextResponse.json(
      { error: "Failed to generate token", details: error.message }, 
      { status: 500 }
    );
  }
}