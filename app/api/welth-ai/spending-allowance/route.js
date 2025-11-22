import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { calculateSpendingAllowance } from "@/lib/spending-allowance";

export async function GET(req) {
    try {
        const user = await checkUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch user's financial data
        const transactions = await db.transaction.findMany({
            where: { userId: user.id },
            orderBy: { date: "desc" },
            take: 100, // Last 100 transactions for pattern analysis
        });

        const accounts = await db.account.findMany({
            where: { userId: user.id },
        });

        const budget = await db.budget.findUnique({
            where: { userId: user.id },
        });

        // Calculate allowance
        const allowance = calculateSpendingAllowance(transactions, accounts, budget);

        return NextResponse.json({
            success: true,
            allowance,
        });

    } catch (error) {
        console.error("Error calculating spending allowance:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
