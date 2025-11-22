"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SpendingAllowance() {
    const [allowance, setAllowance] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAllowance = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/welth-ai/spending-allowance");
            const data = await response.json();
            if (data.success) {
                setAllowance(data.allowance);
            }
        } catch (error) {
            console.error("Failed to fetch allowance:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllowance();
    }, []);

    if (loading) {
        return (
            <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 animate-pulse">
                <div className="h-32 bg-blue-100 rounded"></div>
            </div>
        );
    }

    if (!allowance) return null;

    const colorClasses = {
        green: "from-green-50 to-emerald-50 border-green-300 text-green-700",
        yellow: "from-yellow-50 to-orange-50 border-yellow-300 text-yellow-700",
        red: "from-red-50 to-pink-50 border-red-300 text-red-700",
    };

    return (
        <div className={`p-8 bg-gradient-to-br rounded-2xl border-2 ${colorClasses[allowance.color]}`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-lg font-medium opacity-80">Today's Guilt-Free Spending</h2>
                    <p className="text-sm opacity-60 mt-1">{allowance.message}</p>
                </div>
                <div className="flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Info className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <div className="space-y-2 text-sm">
                                    <p><strong>How it's calculated:</strong></p>
                                    <p>Total Balance: ₹{allowance.breakdown.totalBalance.toFixed(0)}</p>
                                    <p>- Safety Buffer: ₹{allowance.breakdown.safetyBuffer}</p>
                                    <p>- Upcoming Bills: ₹{allowance.breakdown.upcomingBills.toFixed(0)}</p>
                                    <p>= Available: ₹{allowance.breakdown.availableBalance.toFixed(0)}</p>
                                    <p>÷ {allowance.breakdown.daysUntilIncome} days until income</p>
                                    <p className="pt-2 border-t"><strong>= ₹{allowance.amount}/day</strong></p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={fetchAllowance}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold">₹{allowance.amount}</span>
                <span className="text-2xl opacity-60">today</span>
            </div>

            <div className="mt-4 pt-4 border-t border-current opacity-40">
                <p className="text-xs">
                    Available: ₹{allowance.breakdown.availableBalance.toFixed(0)} •
                    Next {allowance.breakdown.daysUntilIncome} days
                </p>
            </div>
        </div>
    );
}
