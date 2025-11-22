import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkUser } from "@/lib/checkUser";
import { NextResponse } from "next/server";
import { defaultCategories } from "@/data/categories";

export async function POST(req) {
    try {
        const user = await checkUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is not defined");
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        const { description, amount, type } = await req.json();

        if (!description) {
            return NextResponse.json({ error: "Description required" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Get available categories
        const categories = type === "EXPENSE"
            ? defaultCategories.EXPENSE
            : defaultCategories.INCOME;

        const prompt = `
      You are a financial assistant helping categorize transactions.
      
      Transaction details:
      - Description: "${description}"
      - Amount: ${amount || "unknown"}
      - Type: ${type || "EXPENSE"}
      
      Available categories: ${categories.join(", ")}
      
      Based on the description, suggest the MOST appropriate category from the list above.
      Return ONLY the category name, nothing else.
    `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const suggestedCategory = result.response.text().trim();

        // Validate that suggested category exists
        const validCategory = categories.find(c =>
            c.toLowerCase() === suggestedCategory.toLowerCase()
        ) || categories[0];

        return NextResponse.json({
            category: validCategory,
            confidence: "high"
        });

    } catch (error) {
        console.error("Error in category suggestion:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
