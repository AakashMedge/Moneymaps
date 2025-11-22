"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VoiceTransaction({ onScanComplete }) {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = "en-US";

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                handleVoiceInput(transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                toast.error("Could not hear you. Please try again.");
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const startListening = () => {
        if (!recognitionRef.current) {
            toast.error("Voice input not supported in this browser");
            return;
        }
        setIsListening(true);
        recognitionRef.current.start();
        toast.info("Listening... Speak now");
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const handleVoiceInput = async (text) => {
        setIsProcessing(true);
        toast.info(`Heard: "${text}". Processing...`);

        try {
            const response = await fetch("/api/welth-ai/parse-transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();

            if (data.success) {
                onScanComplete(data.data);
                toast.success("Transaction details filled!");
            } else {
                toast.error("Could not understand transaction details");
            }
        } catch (error) {
            console.error("Error parsing voice input:", error);
            toast.error("Failed to process voice input");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50/50 hover:bg-purple-50 transition-colors">
            <div className="text-center mb-3">
                <h3 className="font-semibold text-purple-900">Voice Entry</h3>
                <p className="text-xs text-purple-600">"Spent 500 on lunch"</p>
            </div>

            <Button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                variant={isListening ? "destructive" : "default"}
                className={`h-16 w-16 rounded-full shadow-lg transition-all ${isListening ? "animate-pulse bg-red-500 hover:bg-red-600" :
                        "bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105"
                    }`}
            >
                {isProcessing ? (
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                ) : isListening ? (
                    <MicOff className="h-8 w-8 text-white" />
                ) : (
                    <Mic className="h-8 w-8 text-white" />
                )}
            </Button>

            <p className="text-xs text-gray-500 mt-3 font-medium">
                {isProcessing ? "AI is processing..." : isListening ? "Listening..." : "Tap to Speak"}
            </p>
        </div>
    );
}
