"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Glasses, ShieldAlert, MessageSquareText, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const tools = [
    {
        id: "ar",
        title: "AR Budget Goggles",
        description: "Point your camera at any item to see if you can afford it.",
        icon: <Glasses className="h-8 w-8 text-purple-500" />,
        color: "bg-purple-500/10",
        href: "/tools/ar",
        badge: "Visual AI",
    },
    {
        id: "panic",
        title: "Panic Mode",
        description: "Fake wallet interface for duress situations. Shows low balance.",
        icon: <ShieldAlert className="h-8 w-8 text-red-500" />,
        color: "bg-red-500/10",
        href: "/tools/panic",
        badge: "Security",
    },
    {
        id: "negotiator",
        title: "AI Negotiator",
        description: "Get real-time bargaining tactics to save money on deals.",
        icon: <MessageSquareText className="h-8 w-8 text-blue-500" />,
        color: "bg-blue-500/10",
        href: "/tools/negotiator",
        badge: "Assistant",
    },
];

export default function ToolsPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 rounded-full mb-4 border border-gray-700">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-300">Wealth Labs</span>
                </div>
                <h1 className="text-4xl font-bold mb-4">Smart Tools Suite</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Experimental AI features to give you superpowers in financial situations.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <Link key={tool.id} href={tool.href}>
                        <Card className="h-full hover:shadow-lg transition-all hover:border-gray-400 cursor-pointer group relative overflow-hidden">
                            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                                {tool.icon}
                            </div>
                            <CardHeader>
                                <div className={`w-14 h-14 rounded-xl ${tool.color} flex items-center justify-center mb-4`}>
                                    {tool.icon}
                                </div>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                                    {tool.badge && (
                                        <Badge variant="secondary" className="text-xs">
                                            {tool.badge}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base mb-4">
                                    {tool.description}
                                </CardDescription>
                                <div className="flex items-center text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                    Launch Tool <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
