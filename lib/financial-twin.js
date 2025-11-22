/**
 * AI Financial Twin - Personality-driven decision making
 */

export function analyzeSpendingBehavior(transactions, profile) {
    if (!transactions || transactions.length === 0) {
        return {
            riskTolerance: "MODERATE",
            spendingStyle: "BALANCED",
            regretThreshold: 5000,
            emotionalTriggers: [],
        };
    }

    // Analyze spending patterns
    const expenses = transactions.filter(t => t.type === "EXPENSE");
    const avgExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0) / expenses.length;

    // Determine risk tolerance based on large purchases
    const largePurchases = expenses.filter(t => Number(t.amount) > avgExpense * 2);
    const riskTolerance = largePurchases.length > expenses.length * 0.3 ? "HIGH" :
        largePurchases.length > expenses.length * 0.1 ? "MODERATE" : "LOW";

    // Determine spending style based on frequency
    const recentExpenses = expenses.filter(t => {
        const daysAgo = (new Date() - new Date(t.date)) / (1000 * 60 * 60 * 24);
        return daysAgo <= 7;
    });
    const spendingStyle = recentExpenses.length > 10 ? "IMPULSIVE" :
        recentExpenses.length > 5 ? "BALANCED" : "CAUTIOUS";

    // Find regret threshold from profile or estimate
    const regretThreshold = profile?.regretThreshold || avgExpense * 1.5;

    // Identify emotional triggers (categories with high spending)
    const categorySpending = {};
    expenses.forEach(t => {
        if (t.category) {
            categorySpending[t.category] = (categorySpending[t.category] || 0) + Number(t.amount);
        }
    });

    const sortedCategories = Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category]) => category);

    return {
        riskTolerance,
        spendingStyle,
        regretThreshold: Number(regretThreshold),
        emotionalTriggers: sortedCategories,
    };
}

export function generateTwinAdvice(question, amount, profile, transactions) {
    const behavior = analyzeSpendingBehavior(transactions, profile);

    // Analyze similar past purchases
    const similarPurchases = transactions.filter(t =>
        t.type === "EXPENSE" &&
        Math.abs(Number(t.amount) - amount) < amount * 0.3
    );

    const avgSimilarAmount = similarPurchases.length > 0
        ? similarPurchases.reduce((sum, t) => sum + Number(t.amount), 0) / similarPurchases.length
        : amount;

    // Decision logic based on personality
    let decision = "CONSIDER";
    let reasoning = "";
    let confidence = 50;

    // Check against regret threshold
    if (amount > behavior.regretThreshold) {
        decision = "WAIT";
        reasoning = `Based on your history, you tend to regret purchases over ₹${behavior.regretThreshold.toFixed(0)}. `;
        confidence = 75;

        if (profile?.regretPurchase && profile.regretPurchase.toLowerCase().includes(question.toLowerCase().split(' ')[0])) {
            reasoning += `You mentioned regretting similar purchases before. `;
            confidence = 90;
        }
    }

    // Check spending style
    if (behavior.spendingStyle === "IMPULSIVE" && amount > 1000) {
        decision = "WAIT";
        reasoning += `You have an impulsive spending pattern. Wait 24 hours before deciding. `;
        confidence = Math.max(confidence, 70);
    }

    // Check if it aligns with goals
    if (profile?.savingGoal && amount > 5000) {
        decision = "WAIT";
        reasoning += `Remember, you're saving for ${profile.savingGoal}. This could delay your goal. `;
        confidence = 85;
    }

    // Positive signals
    if (profile?.happyPurchase && profile.happyPurchase.toLowerCase().includes(question.toLowerCase().split(' ')[0])) {
        decision = "APPROVE";
        reasoning = `This aligns with what makes you happy! Similar purchases brought you joy before. `;
        confidence = 80;
    }

    // Check if within normal spending
    if (amount < avgSimilarAmount * 0.8 && decision === "CONSIDER") {
        decision = "APPROVE";
        reasoning = `This is below your usual spending for similar items. Seems reasonable! `;
        confidence = 70;
    }

    // Default reasoning
    if (!reasoning) {
        reasoning = `Based on ${similarPurchases.length} similar past purchases, this seems like a typical decision for you. `;
        confidence = 60;
    }

    return {
        decision,
        reasoning: reasoning.trim(),
        confidence,
        similarPurchases: similarPurchases.length,
        behavior,
    };
}

export const personalityQuestions = [
    {
        id: "happyPurchase",
        question: "What recent purchase made you happiest?",
        placeholder: "e.g., New headphones, Weekend trip, Gym membership",
    },
    {
        id: "regretPurchase",
        question: "What purchase do you regret?",
        placeholder: "e.g., Expensive shoes I never wear, Unused subscription",
    },
    {
        id: "financialFear",
        question: "What's your biggest financial fear?",
        placeholder: "e.g., Running out of money, Not saving enough, Debt",
    },
    {
        id: "savingGoal",
        question: "What are you saving for?",
        placeholder: "e.g., Laptop, Emergency fund, Vacation, House",
    },
    {
        id: "moneyFeeling",
        question: "How do you feel about money?",
        placeholder: "e.g., Stressed, Confident, Anxious, In control",
    },
];
