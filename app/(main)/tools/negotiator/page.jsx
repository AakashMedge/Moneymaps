"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Sparkles, User, Bot } from "lucide-react";
import Link from "next/link";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function NegotiatorPage() {
    const [messages, setMessages] = useState([
        { role: "ai", content: "I'm your AI Negotiator. Tell me what the seller just said, and I'll tell you exactly how to reply to get the best price." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            // Call Gemini API (Client-side for prototype speed, ideally server-side)
            // Note: In a real app, use a server action to hide the key. 
            // For this hackathon prototype, we'll assume the key is safe or use a server action if preferred.
            // Let's use a server action pattern or just a direct fetch to a new API route.
            // Actually, let's create a quick API route for this to be clean.

            const response = await fetch("/api/negotiator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: "ai", content: "I'm having trouble thinking of a comeback. Try again?" }]);
            }
        } catch (error) {
            console.error("Negotiator error:", error);
            setMessages(prev => [...prev, { role: "ai", content: "Connection error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b p-4 flex items-center gap-4 shadow-sm z-10">
                <Link href="/tools">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        AI Negotiator
                    </h1>
                    <p className="text-xs text-gray-500">Your bargaining assistant</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === "user"
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                            }`}>
                            <div className="flex items-center gap-2 mb-1 opacity-70 text-xs font-medium">
                                {msg.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                                {msg.role === "user" ? "Seller Said" : "You Say"}
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type what the seller said..."
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <Button onClick={handleSend} disabled={loading || !input.trim()} className="bg-blue-600 hover:bg-blue-700">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
