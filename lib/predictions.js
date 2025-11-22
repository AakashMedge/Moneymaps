/**
 * Calculate predicted cash flow for the next N days
 * Based on historical spending patterns
 */
export function predictCashFlow(transactions, accounts, days = 30) {
    const totalBalance = accounts.reduce((acc, a) => acc + Number(a.balance), 0);

    // Calculate daily average income and expenses
    const last30Days = transactions.filter(t => {
        const daysAgo = (Date.now() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= 30;
    });

    const dailyIncome = last30Days
        .filter(t => t.type === "INCOME")
        .reduce((acc, t) => acc + Number(t.amount), 0) / 30;

    const dailyExpense = last30Days
        .filter(t => t.type === "EXPENSE")
        .reduce((acc, t) => acc + Number(t.amount), 0) / 30;

    const dailyNet = dailyIncome - dailyExpense;

    // Generate predictions
    const predictions = [];
    for (let i = 0; i <= days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        predictions.push({
            date: date.toISOString().split('T')[0],
            predicted: totalBalance + (dailyNet * i),
            dayOffset: i,
        });
    }

    return predictions;
}

/**
 * Calculate historical balance for the last N days
 */
export function calculateHistoricalBalance(transactions, currentBalance, days = 30) {
    const history = [];
    let balance = currentBalance;

    // Sort transactions by date (newest first)
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    for (let i = 0; i <= days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Reverse transactions that happened after this date
        const futureTransactions = sorted.filter(t => new Date(t.date) > date);
        let adjustedBalance = balance;

        futureTransactions.forEach(t => {
            if (t.type === "INCOME") {
                adjustedBalance -= Number(t.amount);
            } else {
                adjustedBalance += Number(t.amount);
            }
        });

        history.unshift({
            date: dateStr,
            balance: adjustedBalance,
            dayOffset: -i,
        });
    }

    return history;
}

/**
 * Calculate safe amount to auto-save
 * Returns 0 if not safe to save
 */
export function calculateSafeToSave(transactions, accounts, budget) {
    const totalBalance = accounts.reduce((acc, a) => acc + Number(a.balance), 0);

    // Don't save if balance is too low
    if (totalBalance < 1000) return 0;

    // Calculate current month expenses
    const currentMonthExpenses = transactions
        .filter(t => t.type === "EXPENSE" && new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((acc, t) => acc + Number(t.amount), 0);

    // Don't save if close to budget limit
    if (budget) {
        const budgetUsage = (currentMonthExpenses / Number(budget.amount)) * 100;
        if (budgetUsage > 70) return 0;
    }

    // Calculate "excess" balance (above minimum threshold)
    const minimumBuffer = 2000; // Keep at least 2000 as buffer
    const excess = totalBalance - minimumBuffer;

    if (excess <= 0) return 0;

    // Save 5% of excess, capped at 500
    const safeAmount = Math.min(excess * 0.05, 500);

    return Math.floor(safeAmount);
}
