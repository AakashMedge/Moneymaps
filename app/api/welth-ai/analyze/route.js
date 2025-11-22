import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const user = await checkUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is not defined");
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // 1. Fetch Financial Data
        const transactions = await db.transaction.findMany({
            where: { userId: user.id },
            orderBy: { date: "desc" },
            take: 20, // Analyze last 20 transactions
        });

        const budget = await db.budget.findUnique({
            where: { userId: user.id },
        });

        const accounts = await db.account.findMany({
            where: { userId: user.id },
        });

        // 2. Construct Prompt for Analysis
        const context = `
      User: ${user.name}
      Total Balance: ${accounts.reduce((acc, a) => acc + Number(a.balance), 0)}
      Budget: ${budget ? budget.amount : "Not set"}
      Recent Transactions:
      ${transactions.map((t) => `- ${t.date.toISOString().split('T')[0]}: ${t.description} (${t.amount}) [${t.type}]`).join("\n")}
    `;

        const prompt = `
      You are Welth AI, a financial advisor.
      Analyze the following financial data for a gig worker.
      Identify 1 or 2 key insights or actionable "nudges" to help them manage their money better.
      Focus on:
      - Savings opportunities
      - Overspending alerts
      - Budget adherence

      Data:
      ${context}

      Return the result as a JSON array of objects with "type" (one of: "SAVINGS", "EXPENSE", "BUDGET", "GENERAL") and "content" (the advice string).
      Example:
      [
        { "type": "SAVINGS", "content": "You spent less this week. Consider moving ₹500 to savings." }
      ]
      Do not wrap in markdown code blocks. Just return the JSON.
    `;

        // 3. Call Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        let insights = [];
        try {
            insights = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse AI response:", responseText);
            // Fallback if JSON parsing fails
            insights = [{ type: "GENERAL", content: responseText }];
        }

        // 4. Store Insights
        // First, clear old insights to keep it fresh (optional strategy)
        // For now, we'll just add new ones.

        const createdInsights = await Promise.all(
            insights.map(async (insight) => {
                return db.insight.create({
                    data: {
                        userId: user.id,
                        type: insight.type || "GENERAL",
                        content: insight.content,
                    },
                });
            })
        );

        return NextResponse.json({ insights: createdInsights });

    } catch (error) {
        console.error("Error in Welth AI Analyze:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
