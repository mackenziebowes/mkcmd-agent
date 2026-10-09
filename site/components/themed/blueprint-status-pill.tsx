import { cn } from "@/lib/utils";

interface BlueprintStatusPillProps {
    children: React.ReactNode;
    className?: string;
}

export function BlueprintStatusPill({
    children,
    className,
}: BlueprintStatusPillProps) {
    return (
        <span
            className={cn(
                "text-[0.7rem] border border-(--ink-primary) px-2 py-0.5 inline-block mt-1",
                className
            )}
        >
            {children}
        </span>
    );
}
