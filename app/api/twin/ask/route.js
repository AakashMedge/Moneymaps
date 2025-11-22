import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateTwinAdvice } from "@/lib/financial-twin";

export async function POST(req) {
    try {
        const user = await checkUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { question, amount } = await req.json();

        if (!question || !amount) {
            return NextResponse.json({ error: "Question and amount required" }, { status: 400 });
        }

        // Fetch user's profile
        const profile = await db.financialProfile.findUnique({
            where: { userId: user.id },
        });

        if (!profile) {
            return NextResponse.json({
                error: "Please complete your personality quiz first",
                needsProfile: true
            }, { status: 400 });
        }

        // Fetch user's transactions
        const transactions = await db.transaction.findMany({
            where: { userId: user.id },
            orderBy: { date: "desc" },
            take: 100,
        });

        // Generate twin advice
        const advice = generateTwinAdvice(question, Number(amount), profile, transactions);

        // Update decision history
        if (advice.decision === "APPROVE") {
            await db.financialProfile.update({
                where: { userId: user.id },
                data: { approvedDecisions: { increment: 1 } },
            });
        } else if (advice.decision === "WAIT") {
            await db.financialProfile.update({
                where: { userId: user.id },
                data: { rejectedDecisions: { increment: 1 } },
            });
        }

        return NextResponse.json({
            success: true,
            advice,
        });

    } catch (error) {
        console.error("Error generating advice:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
