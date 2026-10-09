import { cn } from "@/lib/utils";

interface BlueprintCodeBlockProps {
    label?: string;
    children: React.ReactNode;
    className?: string;
}

export function BlueprintCodeBlock({
    label = "CODE",
    children,
    className,
}: BlueprintCodeBlockProps) {
    return (
        <div
            className={cn(
                "bg-[#f0f4ff] border border-(--ink-primary) p-4 text-sm relative mt-2.5",
                className
            )}
        >
            <span className="absolute -top-2.5 right-2.5 bg-(--paper) px-1 text-[0.6rem] text-(--ink-secondary)">
                {label}
            </span>
            <pre className="whitespace-pre-wrap m-0 font-mono overflow-x-auto [overflow-wrap:anywhere]">{children}</pre>
        </div>
    );
}
