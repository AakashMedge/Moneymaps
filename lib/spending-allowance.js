/**
 * Calculate guilt-free spending allowance for today
 * Takes into account balance, upcoming bills, safety buffer, and income patterns
 */
export function calculateSpendingAllowance(transactions, accounts, budget) {
    // 1. Calculate total available balance
    const totalBalance = accounts.reduce((acc, a) => acc + Number(a.balance), 0);

    // 2. Safety buffer (minimum balance to maintain)
    const safetyBuffer = 2000;

    // 3. Calculate upcoming bills from recurring transactions
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysLeftInMonth = Math.ceil((endOfMonth - today) / (1000 * 60 * 60 * 24));

    const recurringTransactions = transactions.filter(t => t.isRecurring && t.type === "EXPENSE");
    const upcomingBills = recurringTransactions.reduce((sum, t) => {
        // Estimate if bill is due this month
        if (t.recurringInterval === "MONTHLY" || t.recurringInterval === "WEEKLY") {
            return sum + Number(t.amount);
        }
        return sum;
    }, 0);

    // 4. Estimate days until next income
    const recentIncome = transactions
        .filter(t => t.type === "INCOME")
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    let daysUntilIncome = 30; // Default assumption
    if (recentIncome.length >= 2) {
        // Calculate average days between income
        const daysBetween = [];
        for (let i = 0; i < recentIncome.length - 1; i++) {
            const diff = Math.abs(new Date(recentIncome[i].date) - new Date(recentIncome[i + 1].date));
            daysBetween.push(diff / (1000 * 60 * 60 * 24));
        }
        daysUntilIncome = Math.ceil(daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length);
    }

    // 5. Calculate available for spending
    const availableBalance = totalBalance - safetyBuffer - upcomingBills;

    // 6. Calculate daily allowance
    const dailyAllowance = availableBalance > 0 ? availableBalance / daysUntilIncome : 0;

    // 7. Determine status
    let status = "healthy";
    let color = "green";
    if (dailyAllowance < 100) {
        status = "tight";
        color = "red";
    } else if (dailyAllowance < 500) {
        status = "moderate";
        color = "yellow";
    }

    return {
        amount: Math.max(0, Math.floor(dailyAllowance)),
        breakdown: {
            totalBalance,
            safetyBuffer,
            upcomingBills,
            availableBalance: Math.max(0, availableBalance),
            daysUntilIncome,
        },
        status,
        color,
        message: generateMessage(dailyAllowance, status),
    };
}

function generateMessage(amount, status) {
    if (amount <= 0) {
        return "Time to be extra careful with spending. Focus on essentials only.";
    }
    if (status === "tight") {
        return "Budget is tight. Stick to necessities for now.";
    }
    if (status === "moderate") {
        return "You're doing okay. Spend mindfully today.";
    }
    return "You're in good shape! Enjoy your day guilt-free.";
}
