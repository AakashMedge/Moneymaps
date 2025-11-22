"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs";

export default function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { isSignedIn } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Check if user is logged in
        if (!isSignedIn) {
            setMessages([
                ...messages,
                { role: "user", content: input },
                {
                    role: "assistant",
                    content: "Please login first to chat with Welth AI. Click the Login button in the header to get started!"
                }
            ]);
            setInput("");
            return;
        }

        const userMessage = input;
        setInput("");
        setMessages([...messages, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/welth-ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();

            // API returns { message: "..." } not { response: "..." }
            if (data.message) {
                setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
            } else {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "Sorry, I couldn't process that. Please try again."
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Oops! Something went wrong. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
                >
                    <MessageCircle className="h-6 w-6" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                🤖
                            </div>
                            <div>
                                <h3 className="font-semibold">Welth AI</h3>
                                <p className="text-xs opacity-90">Your financial assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 rounded-full p-1 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-8">
                                <p className="text-sm">👋 Hi! I'm your Welth AI assistant.</p>
                                <p className="text-xs mt-2">Ask me anything about your finances!</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === "user"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-800 border border-gray-200"
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                        <div className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={isSignedIn ? "Ask me anything..." : "Login to chat..."}
                                className="flex-1"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                size="icon"
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
