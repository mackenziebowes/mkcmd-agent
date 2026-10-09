import { cn } from "@/lib/utils";

interface BlueprintTerminalProps {
    commands?: string[];
    output?: string[];
    className?: string;
}

export function BlueprintTerminal({
    commands = [],
    output = [],
    className,
}: BlueprintTerminalProps) {
    return (
        <div
            className={cn(
                "mt-5 border border-(--ink-primary) p-0.5",
                className
            )}
        >
            <div className="bg-[#f0f4ff] p-4 font-mono text-sm text-[#333] [overflow-wrap:anywhere]">
                {commands.map((cmd, i) => (
                    <div key={i} className="before:content-['$_'] before:text-(--ink-primary) before:font-bold">
                        {cmd}
                    </div>
                ))}
                {output.length > 0 && (
                    <div className="text-[#666] mt-1">
                        {output.map((line, i) => (
                            <div key={i}>&gt; {line}</div>
                        ))}
                        <span className="inline-block w-2 h-4 bg-(--ink-primary) animate-pulse" />
                    </div>
                )}
            </div>
        </div>
    );
}
