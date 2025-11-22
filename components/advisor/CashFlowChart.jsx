"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

export default function CashFlowChart({ historicalData, predictedData }) {
    // Combine historical and predicted data
    const combinedData = [
        ...historicalData.map(d => ({ ...d, type: "historical" })),
        ...predictedData.map(d => ({ ...d, type: "predicted" })),
    ];

    // Format currency for tooltip
    const formatCurrency = (value) => `₹${value.toFixed(0)}`;

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="text-sm font-medium">{data.date}</p>
                    {data.balance !== undefined && (
                        <p className="text-sm text-blue-600">Balance: {formatCurrency(data.balance)}</p>
                    )}
                    {data.predicted !== undefined && (
                        <p className="text-sm text-green-600">Predicted: {formatCurrency(data.predicted)}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <ReferenceLine x={new Date().toISOString().split('T')[0]} stroke="#9ca3af" strokeDasharray="3 3" label="Today" />

                    {/* Historical line */}
                    <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        name="Actual Balance"
                    />

                    {/* Predicted line */}
                    <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Predicted Balance"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
