import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EmptyState({
    icon: Icon = FileQuestion,
    title = "No data yet",
    description = "Get started by adding your first item",
    actionLabel = "Get Started",
    actionHref = "/dashboard"
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6 max-w-sm">{description}</p>
            {actionHref && (
                <Link href={actionHref}>
                    <Button>{actionLabel}</Button>
                </Link>
            )}
        </div>
    );
}
