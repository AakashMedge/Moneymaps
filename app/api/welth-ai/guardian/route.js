import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";

export async function GET(req) {
    try {
        const user = await checkUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch User's Financial Data
        const transactions = await db.transaction.findMany({
            where: { userId: user.id },
            orderBy: { date: "desc" },
            take: 30,
        });

        const budget = await db.budget.findUnique({
            where: { userId: user.id },
        });

        const accounts = await db.account.findMany({
            where: { userId: user.id },
        });

        // 2. Calculate Current Spending
        const totalBalance = accounts.reduce((acc, a) => acc + Number(a.balance), 0);
        const currentMonthExpenses = transactions
            .filter(t => t.type === "EXPENSE" && new Date(t.date).getMonth() === new Date().getMonth())
            .reduce((acc, t) => acc + Number(t.amount), 0);

        // 3. Safety Guardian Logic (Simplified for Hackathon)
        let actionTaken = null;

        if (budget && !budget.isLocked) {
            const budgetUsagePercent = (currentMonthExpenses / Number(budget.amount)) * 100;

            // If user has spent >80% of budget, lock it
            if (budgetUsagePercent > 80) {
                await db.budget.update({
                    where: { id: budget.id },
                    data: { isLocked: true },
                });

                // Create Insight
                const insight = await db.insight.create({
                    data: {
                        userId: user.id,
                        type: "BUDGET",
                        action: "LOCKED_BUDGET",
                        content: `Safety Guardian locked your budget to protect you from overspending. You've used ${budgetUsagePercent.toFixed(1)}% of your monthly budget.`,
                    },
                });

                // Send Email Alert
                await sendEmail({
                    to: user.email,
                    subject: "🛡️ Safety Guardian Alert - Budget Locked",
                    react: EmailTemplate({
                        userName: user.name || "User",
                        type: "guardian-alert",
                        data: {
                            action: "Budget Locked",
                            reason: `You've used ${budgetUsagePercent.toFixed(1)}% of your monthly budget`,
                            message: `To protect you from overspending, I've temporarily locked your budget. You can unlock it anytime from the dashboard.`,
                        },
                    }),
                });

                actionTaken = {
                    type: "LOCKED_BUDGET",
                    reason: `Budget usage at ${budgetUsagePercent.toFixed(1)}%`,
                    insightId: insight.id,
                };
            }
        }

        // 4. Auto-Savings Logic
        if (!actionTaken && budget && !budget.isLocked) {
            const { calculateSafeToSave } = await import("@/lib/predictions");
            const safeAmount = calculateSafeToSave(transactions, accounts, budget);

            if (safeAmount > 0) {
                // Find or create savings account
                let savingsAccount = accounts.find(a => a.type === "SAVINGS");

                if (!savingsAccount) {
                    savingsAccount = await db.account.create({
                        data: {
                            userId: user.id,
                            name: "Auto-Savings",
                            type: "SAVINGS",
                            balance: 0,
                            isDefault: false,
                        },
                    });
                }

                // Find current account to deduct from
                const currentAccount = accounts.find(a => a.type === "CURRENT" && a.isDefault) || accounts[0];

                if (currentAccount && Number(currentAccount.balance) >= safeAmount) {
                    // Create savings transaction
                    await db.transaction.create({
                        data: {
                            userId: user.id,
                            accountId: savingsAccount.id,
                            type: "INCOME",
                            amount: safeAmount,
                            description: "Auto-Savings Transfer",
                            category: "Savings",
                            date: new Date(),
                            status: "COMPLETED",
                        },
                    });

                    // Update account balances
                    await db.account.update({
                        where: { id: currentAccount.id },
                        data: { balance: Number(currentAccount.balance) - safeAmount },
                    });

                    await db.account.update({
                        where: { id: savingsAccount.id },
                        data: { balance: Number(savingsAccount.balance) + safeAmount },
                    });

                    // Create Insight
                    const insight = await db.insight.create({
                        data: {
                            userId: user.id,
                            type: "SAVINGS",
                            action: "AUTO_SAVED",
                            content: `Smart move! I automatically saved ₹${safeAmount} to your savings account. Your finances are healthy enough to grow your savings.`,
                        },
                    });

                    // Send Email
                    await sendEmail({
                        to: user.email,
                        subject: "💰 Auto-Savings Success!",
                        react: EmailTemplate({
                            userName: user.name || "User",
                            type: "guardian-alert",
                            data: {
                                action: `Saved ₹${safeAmount}`,
                                reason: "Your finances are healthy",
                                message: `I noticed you have some extra buffer, so I moved ₹${safeAmount} to your savings account. Keep up the great work!`,
                            },
                        }),
                    });

                    actionTaken = {
                        type: "AUTO_SAVED",
                        reason: `Saved ₹${safeAmount} to savings`,
                        insightId: insight.id,
                        amount: safeAmount,
                    };
                }
            }
        }

        return NextResponse.json({
            status: "ok",
            actionTaken,
            stats: {
                totalBalance,
                currentMonthExpenses,
                budgetUsage: budget ? (currentMonthExpenses / Number(budget.amount)) * 100 : 0,
                isLocked: budget?.isLocked || false,
            },
        });

    } catch (error) {
        console.error("Error in Safety Guardian:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
