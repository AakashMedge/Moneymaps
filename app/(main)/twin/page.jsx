"use client";

import { useState, useEffect } from "react";
import { Brain, Sparkles, TrendingUp, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { personalityQuestions } from "@/lib/financial-twin";
import { toast } from "sonner";

export default function TwinPage() {
    const [hasProfile, setHasProfile] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);

    // Ask Twin state
    const [question, setQuestion] = useState("");
    const [amount, setAmount] = useState("");
    const [advice, setAdvice] = useState(null);
    const [asking, setAsking] = useState(false);

    useEffect(() => {
        checkProfile();
    }, []);

    const checkProfile = async () => {
        try {
            const response = await fetch("/api/twin/profile");
            const data = await response.json();
            setHasProfile(data.hasProfile);
            setProfile(data.profile);
        } catch (error) {
            console.error("Error checking profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuizAnswer = (questionId, value) => {
        setQuizAnswers({ ...quizAnswers, [questionId]: value });
    };

    const submitQuiz = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/twin/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(quizAnswers),
            });

            const data = await response.json();
            if (data.success) {
                setHasProfile(true);
                setProfile(data.profile);
                toast.success("Your Financial Twin is ready!");
            }
        } catch (error) {
            toast.error("Failed to create profile");
        } finally {
            setLoading(false);
        }
    };

    const askTwin = async () => {
        if (!question || !amount) {
            toast.error("Please enter both question and amount");
            return;
        }

        setAsking(true);
        try {
            const response = await fetch("/api/twin/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, amount: Number(amount) }),
            });

            const data = await response.json();
            if (data.success) {
                setAdvice(data.advice);
            } else {
                toast.error(data.error || "Failed to get advice");
            }
        } catch (error) {
            toast.error("Failed to get advice");
        } finally {
            setAsking(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your twin...</p>
                </div>
            </div>
        );
    }

    // Personality Quiz
    if (!hasProfile) {
        const currentQ = personalityQuestions[currentQuestion];
        const isLastQuestion = currentQuestion === personalityQuestions.length - 1;

        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-4">
                        <Brain className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">AI Personality Quiz</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                        Meet Your Financial Twin
                    </h1>
                    <p className="text-gray-600">
                        Answer 5 quick questions to create your AI twin
                    </p>
                </div>

                <div className="bg-white rounded-2xl border-2 border-purple-200 p-8 shadow-lg">
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                            <span>Question {currentQuestion + 1} of {personalityQuestions.length}</span>
                            <span>{Math.round(((currentQuestion + 1) / personalityQuestions.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${((currentQuestion + 1) / personalityQuestions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-semibold mb-4">{currentQ.question}</h2>
                    <Textarea
                        value={quizAnswers[currentQ.id] || ""}
                        onChange={(e) => handleQuizAnswer(currentQ.id, e.target.value)}
                        placeholder={currentQ.placeholder}
                        className="mb-6 min-h-32"
                    />

                    <div className="flex gap-3">
                        {currentQuestion > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                            >
                                Back
                            </Button>
                        )}
                        {!isLastQuestion ? (
                            <Button
                                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                                disabled={!quizAnswers[currentQ.id]}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                onClick={submitQuiz}
                                disabled={!quizAnswers[currentQ.id] || loading}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                            >
                                {loading ? "Creating Twin..." : "Create My Twin"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Twin Dashboard
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-4">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Your AI Twin</span>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    Ask Your Financial Twin
                </h1>
                <p className="text-gray-600">
                    Get personalized advice based on YOUR financial personality
                </p>
            </div>

            {/* Ask Twin Interface */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-200 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Should I buy this?</h2>
                        <p className="text-sm text-gray-600">Your twin knows you best</p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">What are you considering?</label>
                        <Input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="e.g., New headphones, Weekend trip, Gym membership"
                            className="bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">How much does it cost?</label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="₹ 5000"
                            className="bg-white"
                        />
                    </div>
                </div>

                <Button
                    onClick={askTwin}
                    disabled={asking || !question || !amount}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                    {asking ? "Thinking..." : "Ask My Twin"}
                </Button>
            </div>

            {/* Advice Display */}
            {advice && (
                <div className={`rounded-2xl p-8 border-2 ${advice.decision === "APPROVE" ? "bg-green-50 border-green-300" :
                        advice.decision === "WAIT" ? "bg-orange-50 border-orange-300" :
                            "bg-blue-50 border-blue-300"
                    }`}>
                    <div className="flex items-start gap-4 mb-4">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center ${advice.decision === "APPROVE" ? "bg-green-200" :
                                advice.decision === "WAIT" ? "bg-orange-200" :
                                    "bg-blue-200"
                            }`}>
                            <TrendingUp className={`h-8 w-8 ${advice.decision === "APPROVE" ? "text-green-700" :
                                    advice.decision === "WAIT" ? "text-orange-700" :
                                        "text-blue-700"
                                }`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">
                                {advice.decision === "APPROVE" ? "✅ Go for it!" :
                                    advice.decision === "WAIT" ? "⏸️ Wait a bit" :
                                        "🤔 Think it over"}
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                {advice.reasoning}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="font-medium">
                                    Confidence: {advice.confidence}%
                                </span>
                                <span className="text-gray-600">
                                    Based on {advice.similarPurchases} similar purchases
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Insights */}
            <div className="mt-8 grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm text-gray-600 mb-1">Spending Style</p>
                    <p className="text-xl font-bold text-purple-600">{profile?.spendingStyle}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm text-gray-600 mb-1">Risk Tolerance</p>
                    <p className="text-xl font-bold text-blue-600">{profile?.riskTolerance}</p>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm text-gray-600 mb-1">Decisions Made</p>
                    <p className="text-xl font-bold text-green-600">
                        {(profile?.approvedDecisions || 0) + (profile?.rejectedDecisions || 0)}
                    </p>
                </div>
            </div>
        </div>
    );
}
