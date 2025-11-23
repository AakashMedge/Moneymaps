"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scan, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserAccounts } from "@/actions/dashboard";

export default function ARPage() {
    const router = useRouter();
    const videoRef = useRef(null);
    const [scanning, setScanning] = useState(true);
    const [result, setResult] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const accs = await getUserAccounts();
            setAccounts(accs);
            setLoading(false);
        };
        loadData();

        // Start Camera
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "environment" } })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => console.error("Camera error:", err));

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const handleScan = () => {
        setScanning(true);
        setResult(null);

        // Simulate Analysis
        setTimeout(() => {
            setScanning(false);

            // Randomly generate a product scenario
            const products = [
                { name: "Sony WH-1000XM5", price: 25000, category: "Electronics" },
                { name: "Nike Air Jordan", price: 12000, category: "Shopping" },
                { name: "Starbucks Coffee", price: 450, category: "Food" },
                { name: "MacBook Pro", price: 150000, category: "Electronics" },
            ];
            const product = products[Math.floor(Math.random() * products.length)];

            // Check Affordability (Simple Logic: Can afford if balance > price * 2)
            const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
            const canAfford = totalBalance > (product.price * 1.5);

            setResult({
                ...product,
                canAfford,
                balance: totalBalance
            });

        }, 2000);
    };

    return (
        <div className="min-h-screen bg-black relative flex flex-col">
            {/* Camera View */}
            <div className="absolute inset-0">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover opacity-90"
                />
            </div>

            {/* Header */}
            <div className="relative z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                <Link href="/tools">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div className="bg-black/50 backdrop-blur-md px-4 py-1 rounded-full border border-white/20">
                    <span className="text-cyan-400 text-sm font-mono tracking-widest">AR BUDGET GOGGLES</span>
                </div>
                <div className="w-10" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">

                {scanning && !result && (
                    <div className="flex flex-col items-center">
                        <div className="w-64 h-64 border-2 border-white/30 rounded-2xl relative flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-cyan-500 rounded-2xl animate-pulse" />
                            <Scan className="h-full w-full text-cyan-500/20 animate-ping" />
                            <p className="absolute bottom-4 text-cyan-400 font-mono text-xs">ANALYZING OBJECT...</p>
                        </div>
                        <Button
                            className="mt-8 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/50"
                            onClick={handleScan}
                        >
                            Scan Item
                        </Button>
                    </div>
                )}

                {result && (
                    <div className="w-full max-w-md bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 animate-in zoom-in duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{result.name}</h2>
                                <p className="text-gray-400">₹{result.price.toLocaleString()}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${result.canAfford ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                }`}>
                                {result.category}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className={`p-4 rounded-xl border ${result.canAfford
                                    ? "bg-green-500/10 border-green-500/50"
                                    : "bg-red-500/10 border-red-500/50"
                                }`}>
                                <div className="flex items-center gap-3 mb-2">
                                    {result.canAfford ? (
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                    ) : (
                                        <XCircle className="h-6 w-6 text-red-500" />
                                    )}
                                    <h3 className={`text-lg font-bold ${result.canAfford ? "text-green-400" : "text-red-400"
                                        }`}>
                                        {result.canAfford ? "Safe to Buy" : "Cannot Afford"}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-300">
                                    {result.canAfford
                                        ? "This purchase fits within your safe spending limit."
                                        : `This is ${((result.price / result.balance) * 100).toFixed(1)}% of your total wealth! Not recommended.`
                                    }
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    className="w-full bg-white text-black hover:bg-gray-200"
                                    onClick={() => setResult(null)}
                                >
                                    Scan Another
                                </Button>
                                <Link href="/dashboard" className="w-full">
                                    <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                                        View Budget
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
