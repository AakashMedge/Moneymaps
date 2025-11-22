"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import { toast } from "sonner";

const ChatInterface = () => {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello! I'm Welth AI. How can I help you with your finances today?" },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/welth-ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage.content }),
            });

            if (!response.ok) throw new Error("Failed to get response");

            const data = await response.json();
            setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
        } catch (error) {
            console.error("Chat error:", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] border rounded-lg bg-white shadow-sm">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""
                            }`}
                    >
                        <div
                            className={`p-2 rounded-full ${msg.role === "user" ? "bg-blue-600" : "bg-gray-200"
                                }`}
                        >
                            {msg.role === "user" ? (
                                <User className="h-5 w-5 text-white" />
                            ) : (
                                <Bot className="h-5 w-5 text-gray-700" />
                            )}
                        </div>
                        <div
                            className={`max-w-[80%] p-3 rounded-lg ${msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : "bg-gray-100 text-gray-800 rounded-tl-none"
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-gray-200">
                            <Bot className="h-5 w-5 text-gray-700" />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask about your budget, savings, or spending..."
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
