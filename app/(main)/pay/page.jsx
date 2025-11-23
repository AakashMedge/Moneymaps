"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Loader2, QrCode, ScanLine, Smartphone, Wallet, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { createTransaction } from "@/actions/transaction";
import { toast } from "sonner";
import Link from "next/link";
import { getUserAccounts } from "@/actions/dashboard";

export default function PayPage() {
    const router = useRouter();
    const [step, setStep] = useState("SCAN"); // SCAN, PAYEE, AMOUNT, PIN, PROCESSING, SUCCESS
    const [mode, setMode] = useState("PAY"); // PAY (Expense), RECEIVE (Income)
    const [amount, setAmount] = useState("");
    const [payee, setPayee] = useState("");
    const [pin, setPin] = useState("");
    const [accountId, setAccountId] = useState("");
    const [accounts, setAccounts] = useState([]);
    const videoRef = useRef(null);

    // Load accounts on mount
    useEffect(() => {
        async function loadAccounts() {
            const userAccounts = await getUserAccounts();
            setAccounts(userAccounts);
            const defaultAcc = userAccounts.find(a => a.isDefault) || userAccounts[0];
            if (defaultAcc) setAccountId(defaultAcc.id);
        }
        loadAccounts();
    }, []);

    // Simulate Camera
    useEffect(() => {
        if (step === "SCAN") {
            navigator.mediaDevices
                .getUserMedia({ video: { facingMode: "environment" } })
                .then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch((err) => console.error("Camera error:", err));
        }
        return () => {
            // Cleanup stream
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
            }
        };
    }, [step]);

    const handleScan = () => {
        // Simulate finding a QR code
        setTimeout(() => {
            setStep("PAYEE");
        }, 1000); // Faster scan (1s)
    };

    const handlePayeeSubmit = () => {
        if (!payee.trim()) {
            toast.error("Please enter a name or UPI ID");
            return;
        }
        setStep("AMOUNT");
    };

    const handleAmountSubmit = () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        setStep("PIN");
    };

    const handlePinSubmit = async (enteredPin) => {
        if (enteredPin.length === 4) {
            if (enteredPin === "1234") {
                handlePayment();
            } else {
                toast.error("Incorrect PIN");
                setPin("");
            }
        } else {
            setPin(enteredPin);
        }
    };

    const handlePayment = async () => {
        setStep("PROCESSING");

        try {
            // 1. Simulate Network Delay
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // 2. Create Transaction
            const transactionData = {
                amount: parseFloat(amount),
                description: mode === "PAY" ? `Paid to ${payee}` : `Received from ${payee}`,
                date: new Date(),
                category: "General",
                type: mode === "PAY" ? "EXPENSE" : "INCOME",
                accountId: accountId,
                isRecurring: false,
            };

            const result = await createTransaction(transactionData);

            if (result.success) {
                // 3. Play Sound
                const audio = new Audio("/success.mp3"); // We'll need to add this or use a beep
                audio.play().catch(e => console.log("Audio play failed", e));

                setStep("SUCCESS");

                // 4. Redirect after delay
                setTimeout(() => {
                    router.push("/dashboard");
                }, 3000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Payment failed:", error);
            toast.error("Payment failed. Please try again.");
            setStep("AMOUNT");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between z-10">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-lg font-semibold">Welth Pay</h1>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Content based on Step */}
            <div className="flex-1 flex flex-col relative">

                {/* STEP 1: SCANNER */}
                {step === "SCAN" && (
                    <div className="flex-1 flex flex-col items-center justify-center relative">
                        {/* Camera View */}
                        <div className="absolute inset-0 bg-gray-900">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover opacity-80"
                            />
                        </div>

                        {/* Overlay */}
                        <div className="z-10 flex flex-col items-center w-full max-w-xs space-y-8">
                            {/* Toggle Mode */}
                            <div className="bg-black/50 backdrop-blur-md p-1 rounded-full flex">
                                <button
                                    onClick={() => setMode("PAY")}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === "PAY" ? "bg-red-500 text-white" : "text-gray-300"
                                        }`}
                                >
                                    Pay
                                </button>
                                <button
                                    onClick={() => setMode("RECEIVE")}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === "RECEIVE" ? "bg-green-500 text-white" : "text-gray-300"
                                        }`}
                                >
                                    Receive
                                </button>
                            </div>

                            {/* Scanner Frame */}
                            <div className="relative w-96 h-96 border-2 border-white/30 rounded-3xl flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 border-2 border-cyan-400 rounded-3xl animate-pulse" />
                                <ScanLine className="h-full w-full text-cyan-400/20 animate-ping" />
                                <button
                                    onClick={handleScan}
                                    className="absolute inset-0 w-full h-full cursor-pointer z-20"
                                />
                                <p className="absolute bottom-4 text-xs text-cyan-400 font-mono tracking-widest">
                                    SCANNING...
                                </p>
                            </div>

                            <p className="text-gray-400 text-sm text-center">
                                Point at any QR code to {mode === "PAY" ? "pay" : "receive"}
                            </p>
                        </div>
                    </div>
                )}

                {/* STEP 2: PAYEE INPUT (NEW) */}
                {step === "PAYEE" && (
                    <div className="flex-1 bg-black flex flex-col p-6 animate-in slide-in-from-bottom-full duration-300">
                        <div className="mt-12 mb-8">
                            <h2 className="text-2xl font-bold mb-2">
                                {mode === "PAY" ? "Who are you paying?" : "Requesting from?"}
                            </h2>
                            <p className="text-gray-400">Enter Name, UPI ID or Number</p>
                        </div>

                        <div className="flex-1">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                                <Input
                                    value={payee}
                                    onChange={(e) => setPayee(e.target.value)}
                                    placeholder="e.g. Starbucks, Rahul, 98765..."
                                    className="pl-12 h-14 bg-gray-900 border-gray-800 text-white text-lg rounded-xl focus:ring-cyan-500"
                                    autoFocus
                                />
                            </div>

                            {/* Quick Suggestions (Optional) */}
                            <div className="mt-6">
                                <p className="text-sm text-gray-500 mb-3 uppercase tracking-wider font-semibold">Recents</p>
                                <div className="space-y-2">
                                    {["Starbucks", "Uber", "Zomato", "JioMart"].map((name) => (
                                        <button
                                            key={name}
                                            onClick={() => { setPayee(name); setStep("AMOUNT"); }}
                                            className="w-full p-4 bg-gray-900/50 hover:bg-gray-900 rounded-xl flex items-center gap-3 transition-colors text-left"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-gray-300">
                                                {name[0]}
                                            </div>
                                            <span className="text-white">{name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full h-14 text-lg rounded-full bg-cyan-600 hover:bg-cyan-700 text-white mt-4"
                            onClick={handlePayeeSubmit}
                        >
                            Continue
                        </Button>
                    </div>
                )}

                {/* STEP 3: AMOUNT */}
                {step === "AMOUNT" && (
                    <div className="flex-1 bg-black flex flex-col p-6 animate-in slide-in-from-bottom-full duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                                {payee.charAt(0)}
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">{mode === "PAY" ? "Paying to" : "Requesting from"}</p>
                                <h2 className="text-xl font-bold">{payee}</h2>
                                <p className="text-xs text-gray-500">upi@welth.bank</p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center items-center">
                            <p className="text-gray-500 mb-2">Enter Amount</p>
                            <div className="relative">
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-500">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0"
                                    autoFocus
                                    className="bg-transparent text-6xl font-bold text-white w-full text-center focus:outline-none pl-8"
                                />
                            </div>
                        </div>

                        <div className="mt-auto space-y-4">
                            {/* Account Selector (Simple) */}
                            {accounts.length > 0 && (
                                <div className="bg-gray-900 p-3 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Wallet className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                {accounts.find(a => a.id === accountId)?.name || "Account"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Balance: ₹{accounts.find(a => a.id === accountId)?.balance.toString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-cyan-400">Change</Button>
                                </div>
                            )}

                            <Button
                                size="lg"
                                className={`w-full h-14 text-lg rounded-full ${mode === "PAY"
                                    ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                    }`}
                                onClick={handleAmountSubmit}
                            >
                                Proceed to Pay
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 4: PIN ENTRY */}
                {step === "PIN" && (
                    <div className="flex-1 bg-black flex flex-col p-6 items-center animate-in slide-in-from-bottom-full duration-300">
                        <div className="mt-12 mb-8 text-center">
                            <Lock className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Enter UPI PIN</h2>
                            <p className="text-gray-400">Paying ₹{amount} to {payee}</p>
                        </div>

                        {/* PIN Dots */}
                        <div className="flex gap-4 mb-12">
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`w-4 h-4 rounded-full border-2 ${pin.length > i
                                            ? "bg-white border-white"
                                            : "border-gray-600"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Number Pad */}
                        <div className="grid grid-cols-3 gap-x-12 gap-y-8 w-full max-w-xs mx-auto">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handlePinSubmit(pin + num)}
                                    className="text-3xl font-medium text-white hover:bg-white/10 rounded-full w-16 h-16 flex items-center justify-center transition-colors"
                                >
                                    {num}
                                </button>
                            ))}
                            <div /> {/* Empty slot */}
                            <button
                                onClick={() => handlePinSubmit(pin + "0")}
                                className="text-3xl font-medium text-white hover:bg-white/10 rounded-full w-16 h-16 flex items-center justify-center transition-colors"
                            >
                                0
                            </button>
                            <button
                                onClick={() => setPin(pin.slice(0, -1))}
                                className="text-white hover:bg-white/10 rounded-full w-16 h-16 flex items-center justify-center transition-colors"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 5: PROCESSING */}
                {step === "PROCESSING" && (
                    <div className="flex-1 bg-black flex flex-col items-center justify-center space-y-8">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full border-4 border-gray-800" />
                            <div className="absolute inset-0 h-24 w-24 rounded-full border-4 border-t-cyan-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Smartphone className="h-8 w-8 text-gray-500 animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white mb-2">Processing Payment...</h3>
                            <p className="text-gray-500">Do not close this window</p>
                        </div>
                    </div>
                )}

                {/* STEP 6: SUCCESS */}
                {step === "SUCCESS" && (
                    <div className="flex-1 bg-green-600 flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-300">
                        <div className="h-32 w-32 bg-white rounded-full flex items-center justify-center shadow-2xl">
                            <Check className="h-16 w-16 text-green-600 stroke-[4]" />
                        </div>
                        <div className="text-center text-white">
                            <h2 className="text-3xl font-bold mb-2">₹{amount}</h2>
                            <p className="text-lg opacity-90">
                                {mode === "PAY" ? "Paid successfully" : "Received successfully"}
                            </p>
                        </div>
                        <div className="absolute bottom-12 text-white/60 text-sm">
                            Redirecting to Dashboard...
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
