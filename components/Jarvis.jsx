"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Jarvis() {
    const [script, setScript] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const fetchBriefing = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/welth-ai/jarvis");
            const data = await response.json();

            if (data.success) {
                setScript(data.script);
                speak(data.script);
            } else {
                toast.error("Jarvis is offline right now.");
            }
        } catch (error) {
            console.error("Jarvis Error:", error);
            toast.error("Failed to connect to Jarvis.");
        } finally {
            setIsLoading(false);
        }
    };

    const speak = (text) => {
        if (!window.speechSynthesis) {
            toast.error("Your browser doesn't support speech synthesis.");
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a good voice (Google US English or similar)
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
            (voice) => voice.name.includes("Google US English") || voice.name.includes("Samantha")
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 1;
        utterance.pitch = 1;

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    };

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    return (
        <div className="fixed bottom-24 right-6 z-50">
            <AnimatePresence>
                {isPlaying && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        className="absolute bottom-16 right-0 mb-2 p-4 bg-black/80 backdrop-blur-md text-white rounded-xl shadow-2xl w-64 border border-white/10"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                                Jarvis Active
                            </span>
                        </div>
                        <p className="text-sm text-gray-300 italic line-clamp-4">
                            "{script}"
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={isPlaying ? stopSpeaking : fetchBriefing}
                disabled={isLoading}
                className={`
          h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300
          ${isPlaying
                        ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                        : "bg-black hover:bg-gray-900 shadow-black/30 border-2 border-cyan-500/50"
                    }
        `}
            >
                {isLoading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : isPlaying ? (
                    <Square className="h-5 w-5 text-white fill-current" />
                ) : (
                    <div className="relative">
                        <Mic className="h-6 w-6 text-cyan-400" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                        </span>
                    </div>
                )}
            </motion.button>
        </div>
    );
}
