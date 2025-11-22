import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { analyzeSpendingBehavior } from "@/lib/financial-twin";

export async function POST(req) {
    try {
        const user = await checkUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const answers = await req.json();

        // Fetch user's transactions for behavioral analysis
        const transactions = await db.transaction.findMany({
            where: { userId: user.id },
            orderBy: { date: "desc" },
        });

        // Analyze spending behavior
        const behavior = analyzeSpendingBehavior(transactions, null);

        // Create or update profile
        const profile = await db.financialProfile.upsert({
            where: { userId: user.id },
            update: {
                ...answers,
                ...behavior,
                updatedAt: new Date(),
            },
            create: {
                userId: user.id,
                ...answers,
                ...behavior,
            },
        });

        return NextResponse.json({
            success: true,
            profile,
        });

    } catch (error) {
        console.error("Error saving profile:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const user = await checkUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await db.financialProfile.findUnique({
            where: { userId: user.id },
        });

        return NextResponse.json({
            success: true,
            profile,
            hasProfile: !!profile,
        });

    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
