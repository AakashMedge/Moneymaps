import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const user = await checkUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { description, amount, date, accountId } = await req.json();

        if (!description || !amount) {
            return NextResponse.json({ error: "Description and amount required" }, { status: 400 });
        }

        // Fetch recent transactions (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentTransactions = await db.transaction.findMany({
            where: {
                userId: user.id,
                date: {
                    gte: sevenDaysAgo,
                },
            },
            orderBy: { date: "desc" },
            take: 50,
        });

        // Check for potential duplicates
        const potentialDuplicates = recentTransactions.filter(t => {
            const amountMatch = Math.abs(Number(t.amount) - Number(amount)) < 1; // Within ₹1
            const descriptionMatch = t.description?.toLowerCase().includes(description.toLowerCase()) ||
                description.toLowerCase().includes(t.description?.toLowerCase() || "");

            // Check if same day
            const transactionDate = new Date(t.date);
            const newDate = date ? new Date(date) : new Date();
            const sameDay = transactionDate.toDateString() === newDate.toDateString();

            return amountMatch && descriptionMatch && sameDay;
        });

        if (potentialDuplicates.length > 0) {
            const duplicate = potentialDuplicates[0];
            const timeDiff = Math.abs(new Date() - new Date(duplicate.createdAt)) / (1000 * 60); // minutes

            return NextResponse.json({
                isDuplicate: true,
                warning: `Similar transaction found: ₹${duplicate.amount} for "${duplicate.description}" added ${Math.round(timeDiff)} minutes ago.`,
                duplicate: {
                    id: duplicate.id,
                    amount: duplicate.amount,
                    description: duplicate.description,
                    date: duplicate.date,
                },
            });
        }

        return NextResponse.json({ isDuplicate: false });

    } catch (error) {
        console.error("Error in duplicate check:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
