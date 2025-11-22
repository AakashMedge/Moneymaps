"use client";

import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function GuardianTrigger() {
    const [isLoading, setIsLoading] = useState(false);

    const triggerGuardian = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/welth-ai/guardian");
            const data = await response.json();

            if (data.actionTaken) {
                toast.success(`Guardian Action: ${data.actionTaken.type}`, {
                    description: data.actionTaken.reason,
                });
            } else {
                toast.info("Guardian Check Complete", {
                    description: "No action needed. Your finances look good!",
                });
            }
        } catch (error) {
            toast.error("Failed to run guardian check");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={triggerGuardian}
            disabled={isLoading}
            className="w-full flex items-center gap-2"
            variant="outline"
        >
            <Shield className="h-4 w-4" />
            {isLoading ? "Checking..." : "Run Safety Check"}
        </Button>
    );
}
