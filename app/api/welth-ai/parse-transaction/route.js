import { checkUser } from "@/lib/checkUser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const user = await checkUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { text } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Gemini API key not found" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
      Parse this transaction text into JSON: "${text}"
      
      Return ONLY a JSON object with these fields:
      - amount: number (extract amount)
      - category: string (guess best category from: Housing, Transportation, Food, Utilities, Insurance, Healthcare, Saving, Personal, Entertainment, Miscellaneous, Salary, Investment, Gift)
      - type: "EXPENSE" or "INCOME" (default to EXPENSE, but set to INCOME if text contains: received, income, salary, deposit, earned, got, paid to me)
      - date: string (ISO date format YYYY-MM-DD, assume today unless specified)
      - description: string (clean description)
      
      Edge Cases:
      - If text is "income receive 5000", type is INCOME, category is Salary or Miscellaneous.
      - If text is "got 500 from mom", type is INCOME, category is Gift.
      - If text is "paid 500", type is EXPENSE.
      
      Example: "Spent 500 on lunch" -> {"amount": 500, "category": "Food", "type": "EXPENSE", "date": "2024-03-20", "description": "lunch"}
      Example: "Received 5000 salary" -> {"amount": 5000, "category": "Salary", "type": "INCOME", "date": "2024-03-20", "description": "salary"}
    `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Clean up response to ensure valid JSON
        const cleanResponse = response.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedData = JSON.parse(cleanResponse);

        return NextResponse.json({
            success: true,
            data: parsedData,
        });

    } catch (error) {
        console.error("Error parsing transaction:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
