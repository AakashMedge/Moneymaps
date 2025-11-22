/**
 * Generate AI-powered financial summary for dashboard
 */
export function generateAISummary(transactions, accounts, budget, insights) {
    const summaries = [];
    const today = new Date();

    // 1. Budget Status
    if (budget) {
        const currentMonthExpenses = transactions
            .filter(t => t.type === "EXPENSE" && new Date(t.date).getMonth() === today.getMonth())
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const budgetUsage = (currentMonthExpenses / Number(budget.amount)) * 100;
        const remaining = Number(budget.amount) - currentMonthExpenses;

        if (budgetUsage < 70) {
            summaries.push({
                type: "success",
                icon: "🎉",
                message: `You're ₹${remaining.toFixed(0)} under budget this month`,
                detail: `${budgetUsage.toFixed(0)}% used`,
            });
        } else if (budgetUsage < 90) {
            summaries.push({
                type: "warning",
                icon: "⚠️",
                message: `Budget is ${budgetUsage.toFixed(0)}% used`,
                detail: `₹${remaining.toFixed(0)} remaining`,
            });
        } else {
            summaries.push({
                type: "danger",
                icon: "🚨",
                message: `Budget almost exhausted`,
                detail: `Only ₹${remaining.toFixed(0)} left`,
            });
        }
    }

    // 2. Spending Trend
    const last7Days = transactions.filter(t => {
        const daysAgo = (today - new Date(t.date)) / (1000 * 60 * 60 * 24);
        return daysAgo <= 7 && t.type === "EXPENSE";
    });

    const prev7Days = transactions.filter(t => {
        const daysAgo = (today - new Date(t.date)) / (1000 * 60 * 60 * 24);
        return daysAgo > 7 && daysAgo <= 14 && t.type === "EXPENSE";
    });

    const thisWeekSpending = last7Days.reduce((sum, t) => sum + Number(t.amount), 0);
    const lastWeekSpending = prev7Days.reduce((sum, t) => sum + Number(t.amount), 0);

    if (lastWeekSpending > 0) {
        const change = ((thisWeekSpending - lastWeekSpending) / lastWeekSpending) * 100;
        if (change < -10) {
            summaries.push({
                type: "success",
                icon: "📉",
                message: `You spent ${Math.abs(change).toFixed(0)}% less this week`,
                detail: `₹${thisWeekSpending.toFixed(0)} vs ₹${lastWeekSpending.toFixed(0)}`,
            });
        } else if (change > 10) {
            summaries.push({
                type: "info",
                icon: "📈",
                message: `Spending up ${change.toFixed(0)}% this week`,
                detail: `₹${thisWeekSpending.toFixed(0)} vs ₹${lastWeekSpending.toFixed(0)}`,
            });
        }
    }

    // 3. Upcoming Bills
    const recurringExpenses = transactions.filter(t =>
        t.isRecurring && t.type === "EXPENSE"
    );

    if (recurringExpenses.length > 0) {
        const nextBill = recurringExpenses[0];
        summaries.push({
            type: "info",
            icon: "📅",
            message: `${nextBill.description} due soon`,
            detail: `₹${Number(nextBill.amount).toFixed(0)}`,
        });
    }

    // 4. Recent AI Actions
    const recentActions = insights
        .filter(i => i.action)
        .slice(0, 1);

    if (recentActions.length > 0) {
        const action = recentActions[0];
        summaries.push({
            type: action.action === "AUTO_SAVED" ? "success" : "warning",
            icon: action.action === "AUTO_SAVED" ? "💰" : "🛡️",
            message: action.content.substring(0, 60) + "...",
            detail: "AI action",
        });
    }

    return summaries.slice(0, 4); // Return max 4 summaries
}
