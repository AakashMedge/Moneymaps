"use client";

import { useState } from "react";
import { ClipboardPaste, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function SmartPaste({ onScanComplete }) {
    const [text, setText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleParse = async () => {
        if (!text.trim()) return;

        setIsProcessing(true);
        try {
            const response = await fetch("/api/welth-ai/parse-transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();

            if (data.success) {
                onScanComplete(data.data);
                toast.success("Transaction details parsed!");
                setIsOpen(false);
                setText("");
            } else {
                toast.error("Could not understand the text");
            }
        } catch (error) {
            console.error("Error parsing text:", error);
            toast.error("Failed to process text");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300">
                    <ClipboardPaste className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm font-medium text-blue-700">Smart Paste</span>
                    <span className="text-xs text-blue-500">Bank SMS / Email</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Smart Paste Automation</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="Paste bank SMS or email here...
Example: 'Acct XX89 debited INR 500.00 for SWIGGY on 20-Nov'"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[150px]"
                    />
                    <Button onClick={handleParse} disabled={isProcessing || !text.trim()} className="bg-blue-600 hover:bg-blue-700">
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Auto-Fill Transaction"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
