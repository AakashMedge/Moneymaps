import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GET(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            include: {
                accounts: true,
                transactions: {
                    orderBy: { date: "desc" },
                    take: 5, // Last 5 transactions
                },
                budgets: true,
            },
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        // Calculate basic stats
        const totalBalance = user.accounts.reduce((sum, acc) => sum + acc.balance.toNumber(), 0);
        const lastTransaction = user.transactions[0];

        // Prepare prompt for Gemini
        const prompt = `
      You are Jarvis, a personal financial assistant. Write a SHORT, conversational morning briefing script for the user.
      
      User Data:
      - Name: ${user.name || "Sir"}
      - Total Balance: ${totalBalance}
      - Last Transaction: ${lastTransaction ? `${lastTransaction.type} of ${lastTransaction.amount} for ${lastTransaction.description}` : "None recently"}
      - Recent Activity: ${user.transactions.length} transactions recently.
      
      Instructions:
      - Keep it under 4 sentences.
      - Be professional but slightly witty (Iron Man style).
      - Summarize their financial status.
      - Give one quick tip or observation.
      - Do NOT use markdown or bullet points. Just plain text for speech synthesis.
    `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const script = result.response.text();

        return NextResponse.json({ success: true, script });
    } catch (error) {
        console.error("Error generating Jarvis script:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
