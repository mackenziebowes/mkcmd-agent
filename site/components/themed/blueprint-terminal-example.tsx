import { cn } from "@/lib/utils";

interface BlueprintTerminalExampleProps {
    command: string;
    output?: string;
    className?: string;
}

export function BlueprintTerminalExample({
    command,
    output,
    className,
}: BlueprintTerminalExampleProps) {
    return (
        <div
            className={cn(
                "bg-[#1a1a1a] text-white p-4 border-l-4 border-(--ink-primary) text-sm font-mono",
                className
            )}
        >
            <div>$ {command}</div>
            {output && (
                <div className="opacity-50 mt-1">&gt; {output}</div>
            )}
        </div>
    );
}
