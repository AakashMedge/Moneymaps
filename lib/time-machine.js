/**
 * Financial Time Machine - Calculate alternate realities
 */

export function calculateAlternateTimeline(transactions, accounts, scenario) {
    const { type, amount, startDate } = scenario;

    const currentBalance = accounts.reduce((acc, a) => acc + Number(a.balance), 0);
    const start = new Date(startDate);
    const today = new Date();
    const monthsPassed = Math.floor((today - start) / (1000 * 60 * 60 * 24 * 30));

    let alternateBalance = currentBalance;
    let savedAmount = 0;
    let avoidedExpenses = 0;

    switch (type) {
        case "SAVE_MONTHLY":
            // If user had saved X per month
            savedAmount = amount * monthsPassed;
            alternateBalance = currentBalance + savedAmount;
            break;

        case "AVOID_CATEGORY":
            // If user had avoided spending in a category
            const categoryExpenses = transactions
                .filter(t => t.category === scenario.category && new Date(t.date) >= start)
                .reduce((sum, t) => sum + Number(t.amount), 0);
            avoidedExpenses = categoryExpenses;
            alternateBalance = currentBalance + avoidedExpenses;
            break;

        case "REDUCE_SPENDING":
            // If user had reduced spending by X%
            const totalExpenses = transactions
                .filter(t => t.type === "EXPENSE" && new Date(t.date) >= start)
                .reduce((sum, t) => sum + Number(t.amount), 0);
            const reduction = totalExpenses * (amount / 100);
            alternateBalance = currentBalance + reduction;
            savedAmount = reduction;
            break;
    }

    const difference = alternateBalance - currentBalance;
    const percentageGain = ((difference / currentBalance) * 100).toFixed(1);

    // Ensure savings is always a number
    const currentSavings = Number(accounts.find(a => a.type === "SAVINGS")?.balance || 0);

    return {
        current: {
            balance: Number(currentBalance),
            savings: currentSavings,
        },
        alternate: {
            balance: Number(alternateBalance),
            savings: currentSavings + savedAmount,
        },
        impact: {
            difference: Number(difference),
            percentageGain,
            savedAmount: Number(savedAmount),
            avoidedExpenses: Number(avoidedExpenses),
            monthsPassed,
        },
        message: generateMessage(type, difference, monthsPassed, amount),
    };
}

function generateMessage(type, difference, months, amount) {
    const messages = {
        SAVE_MONTHLY: `If you had saved ₹${amount}/month for the past ${months} months, you'd have ₹${difference.toFixed(0)} MORE today! 🎯`,
        AVOID_CATEGORY: `By avoiding this spending, you'd have ₹${difference.toFixed(0)} extra in your account! 💰`,
        REDUCE_SPENDING: `Reducing spending by ${amount}% would have given you ₹${difference.toFixed(0)} more! 📈`,
    };

    return messages[type] || "See how different choices create different futures!";
}

export function getQuickScenarios() {
    return [
        {
            id: 1,
            title: "Save ₹1,000/month",
            description: "What if you saved ₹1,000 every month?",
            type: "SAVE_MONTHLY",
            amount: 1000,
            icon: "💰",
        },
        {
            id: 2,
            title: "Save ₹2,000/month",
            description: "What if you saved ₹2,000 every month?",
            type: "SAVE_MONTHLY",
            amount: 2000,
            icon: "🎯",
        },
        {
            id: 3,
            title: "Reduce spending 20%",
            description: "What if you spent 20% less overall?",
            type: "REDUCE_SPENDING",
            amount: 20,
            icon: "📉",
        },
        {
            id: 4,
            title: "Reduce spending 30%",
            description: "What if you spent 30% less overall?",
            type: "REDUCE_SPENDING",
            amount: 30,
            icon: "🔥",
        },
    ];
}
