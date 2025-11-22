"use client";

import { useState } from "react";
import { ArrowRight, Clock, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getQuickScenarios } from "@/lib/time-machine";

export default function TimeMachinePage() {
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const scenarios = getQuickScenarios();

    const runScenario = async (scenario) => {
        setSelectedScenario(scenario);
        setLoading(true);

        try {
            const response = await fetch("/api/time-machine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scenario }),
            });

            const data = await response.json();
            if (data.success) {
                setResult(data.result);
            }
        } catch (error) {
            console.error("Time machine error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full mb-4">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">AI-Powered</span>
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                    Financial Time Machine
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    See alternate financial realities. Discover what could have been - and what still can be.
                </p>
            </div>

            {/* Quick Scenarios */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                    Explore Alternate Timelines
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {scenarios.map((scenario) => (
                        <button
                            key={scenario.id}
                            onClick={() => runScenario(scenario)}
                            className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all text-left group hover:shadow-lg"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-4xl">{scenario.icon}</span>
                                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="font-semibold text-lg mb-1">{scenario.title}</h3>
                            <p className="text-sm text-gray-600">{scenario.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Calculating alternate timeline...</p>
                </div>
            )}

            {result && !loading && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-200">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                        Your Alternate Reality
                    </h2>

                    {/* Comparison */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Current Reality */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">Current Reality</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Total Balance</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        ₹{result.current.balance.toFixed(0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Savings</p>
                                    <p className="text-xl font-semibold text-gray-700">
                                        ₹{result.current.savings.toFixed(0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Alternate Reality */}
                        <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <h3 className="text-sm font-medium opacity-90 mb-4">Alternate Reality ✨</h3>
                            <div className="space-y-3 relative z-10">
                                <div>
                                    <p className="text-sm opacity-90">Total Balance</p>
                                    <p className="text-3xl font-bold">
                                        ₹{result.alternate.balance.toFixed(0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm opacity-90">Savings</p>
                                    <p className="text-xl font-semibold">
                                        ₹{result.alternate.savings.toFixed(0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Impact */}
                    <div className="bg-white rounded-xl p-6 border-2 border-purple-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Difference</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    +₹{result.impact.difference.toFixed(0)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    ({result.impact.percentageGain}% more)
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-700 text-lg font-medium">
                            {result.message}
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="mt-6 text-center">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
                        >
                            Start This Timeline Today →
                        </Button>
                        <p className="text-sm text-gray-600 mt-2">
                            It's not too late to create this reality
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
