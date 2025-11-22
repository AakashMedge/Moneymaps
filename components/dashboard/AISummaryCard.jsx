"use client";

import { TrendingDown, TrendingUp, AlertCircle, CheckCircle, Info } from "lucide-react";

export default function AISummaryCard({ summaries }) {
    if (!summaries || summaries.length === 0) return null;

    const getIcon = (type) => {
        switch (type) {
            case "success": return <CheckCircle className="h-5 w-5 text-green-600" />;
            case "warning": return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            case "danger": return <AlertCircle className="h-5 w-5 text-red-600" />;
            default: return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getColorClasses = (type) => {
        switch (type) {
            case "success": return "bg-green-50 border-green-200";
            case "warning": return "bg-yellow-50 border-yellow-200";
            case "danger": return "bg-red-50 border-red-200";
            default: return "bg-blue-50 border-blue-200";
        }
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🤖</span>
                <h2 className="text-xl font-semibold text-gray-800">AI Insights</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summaries.map((summary, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border ${getColorClasses(summary.type)}`}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0">{summary.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm">
                                    {summary.message}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    {summary.detail}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
