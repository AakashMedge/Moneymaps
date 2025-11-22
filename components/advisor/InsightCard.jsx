import React from "react";
import { TrendingUp, TrendingDown, AlertCircle, Wallet } from "lucide-react";

const InsightCard = ({ insight }) => {
    const getIcon = (type) => {
        switch (type) {
            case "SAVINGS":
                return <TrendingUp className="h-5 w-5 text-green-500" />;
            case "EXPENSE":
                return <TrendingDown className="h-5 w-5 text-red-500" />;
            case "BUDGET":
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            default:
                return <Wallet className="h-5 w-5 text-blue-500" />;
        }
    };

    const getBorderColor = (type) => {
        switch (type) {
            case "SAVINGS":
                return "border-green-200 bg-green-50";
            case "EXPENSE":
                return "border-red-200 bg-red-50";
            case "BUDGET":
                return "border-yellow-200 bg-yellow-50";
            default:
                return "border-blue-200 bg-blue-50";
        }
    };

    return (
        <div className={`p-4 rounded-lg border ${getBorderColor(insight.type)} flex items-start gap-3 mb-4`}>
            <div className="mt-1 bg-white p-2 rounded-full shadow-sm">
                {getIcon(insight.type)}
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 capitalize mb-1">{insight.type.toLowerCase()} Insight</h4>
                <p className="text-gray-600 text-sm">{insight.content}</p>
            </div>
        </div>
    );
};

export default InsightCard;
