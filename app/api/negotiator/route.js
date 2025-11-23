import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        const { message } = await req.json();

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            You are a world-class negotiator and bargaining expert. 
            The user is trying to buy something (or rent something) and will tell you what the SELLER just said.
            
            Your goal: Provide the PERFECT counter-response for the user to say to get a better deal.
            
            Rules:
            1. Be concise. Give the exact script to say.
            2. Be firm but polite.
            3. Use psychological tactics (anchoring, silence, walking away).
            4. If the seller is being unreasonable, tell the user to walk away.
            
            Seller said: "${message}"
            
            Your response format:
            "Say this: [The exact sentence]"
            (Optional) "Why: [Brief explanation of the tactic]"
        `;

        const result = await model.generateContent(prompt);
        const reply = result.response.text();

        return NextResponse.json({ success: true, reply });
    } catch (error) {
        console.error("Negotiator API error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate response" }, { status: 500 });
    }
}
