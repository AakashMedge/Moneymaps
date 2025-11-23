"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, AlertTriangle, Wallet, CreditCard } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function PanicPage() {
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            toast.error("Network Error: Unable to fetch latest data");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Fake Header */}
            <div className="bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
                <Link href="/tools">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </Button>
                </Link>
                <h1 className="text-lg font-bold text-gray-800">Dashboard</h1>
                <Button variant="ghost" size="icon" onClick={handleRefresh}>
                    <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
            </div>

            {/* Fake Content */}
            <div className="p-4 space-y-6">
                {/* Balance Card */}
                <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹ 482.50</div>
                        <p className="text-xs text-gray-500 mt-1">Last updated: Just now</p>
                    </CardContent>
                </Card>

                {/* Fake Accounts */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">Accounts</h2>

                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Wallet className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Savings Account</p>
                                    <p className="text-xs text-gray-500">**** 8821</p>
                                </div>
                            </div>
                            <span className="font-bold text-gray-700">₹ 482.50</span>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 flex items-center justify-between opacity-60">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <CreditCard className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Credit Card</p>
                                    <p className="text-xs text-red-500">Payment Overdue</p>
                                </div>
                            </div>
                            <span className="font-bold text-red-500">- ₹ 12,000.00</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Fake Transactions */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">Recent Transactions</h2>

                    {[
                        { name: "Grocery Store", amount: "- ₹ 150.00", date: "Yesterday" },
                        { name: "Bus Ticket", amount: "- ₹ 25.00", date: "Yesterday" },
                        { name: "Mobile Recharge", amount: "- ₹ 199.00", date: "2 days ago" },
                    ].map((tx, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                            <div>
                                <p className="font-medium text-gray-800">{tx.name}</p>
                                <p className="text-xs text-gray-500">{tx.date}</p>
                            </div>
                            <span className="font-medium text-gray-800">{tx.amount}</span>
                        </div>
                    ))}
                </div>

                {/* Error Banner */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-yellow-800">Server Maintenance</h3>
                        <p className="text-xs text-yellow-700 mt-1">
                            Some features are currently unavailable due to scheduled maintenance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
