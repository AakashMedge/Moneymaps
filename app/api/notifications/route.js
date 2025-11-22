import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const user = await checkUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch insights with actions (AI notifications)
        const notifications = await db.insight.findMany({
            where: {
                userId: user.id,
                action: { not: null },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        // Format notifications
        const formatted = notifications.map(n => ({
            id: n.id,
            type: n.action,
            message: n.content,
            timestamp: n.createdAt,
            icon: getIconForAction(n.action),
            color: getColorForAction(n.action),
        }));

        return NextResponse.json({
            success: true,
            notifications: formatted,
            unreadCount: formatted.length,
        });

    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

function getIconForAction(action) {
    switch (action) {
        case "LOCKED_BUDGET": return "🛡️";
        case "AUTO_SAVED": return "💰";
        default: return "🔔";
    }
}

function getColorForAction(action) {
    switch (action) {
        case "LOCKED_BUDGET": return "orange";
        case "AUTO_SAVED": return "green";
        default: return "blue";
    }
}
