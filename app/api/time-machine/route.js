import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { calculateAlternateTimeline } from "@/lib/time-machine";

export async function POST(req) {
    try {
        const user = await checkUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { scenario } = await req.json();

        // Fetch user data
        const transactions = await db.transaction.findMany({
            where: { userId: user.id },
            orderBy: { date: "desc" },
        });

        const accounts = await db.account.findMany({
            where: { userId: user.id },
        });

        // Set default start date if not provided (3 months ago)
        if (!scenario.startDate) {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            scenario.startDate = threeMonthsAgo.toISOString();
        }

        // Calculate alternate timeline
        const result = calculateAlternateTimeline(transactions, accounts, scenario);

        return NextResponse.json({
            success: true,
            result,
        });

    } catch (error) {
        console.error("Error in time machine:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
