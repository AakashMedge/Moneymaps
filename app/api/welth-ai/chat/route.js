import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Fetch User Context (Transactions & Budget)
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 5,
    });

    const budget = await db.budget.findUnique({
      where: { userId: user.id },
    });

    const accounts = await db.account.findMany({
      where: { userId: user.id },
    });

    // 2. Construct Prompt
    const context = `
      User: ${user.name}
      Total Accounts Balance: ${accounts.reduce((acc, a) => acc + Number(a.balance), 0)}
      Budget: ${budget ? budget.amount : "Not set"}
      Recent Transactions:
      ${transactions.map((t) => `- ${t.date.toISOString().split('T')[0]}: ${t.description} (${t.amount}) [${t.type}]`).join("\n")}
    `;

    const prompt = `
      You are Welth AI, a financial advisor for gig economy workers.
      Your goal is to provide proactive, empathetic, and actionable financial advice.
      
      User Context:
      ${context}

      User Message: "${message}"

      Respond to the user in a helpful and concise manner. Focus on their financial well-being.
    `;

    // 3. Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // 4. Save Chat History
    await db.chatMessage.createMany({
      data: [
        { userId: user.id, role: "user", content: message },
        { userId: user.id, role: "assistant", content: response },
      ],
    });

    return NextResponse.json({ message: response });

  } catch (error) {
    console.error("Error in Welth AI Chat:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
