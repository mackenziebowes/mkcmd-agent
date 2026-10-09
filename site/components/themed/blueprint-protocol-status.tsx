import { cn } from "@/lib/utils";

interface BlueprintProtocolStatusProps {
    protocols: { name: string; status: "active" | "inert" }[];
    className?: string;
}

export function BlueprintProtocolStatus({
    protocols,
    className,
}: BlueprintProtocolStatusProps) {
    return (
        <div
            className={cn(
                "text-[0.7rem] text-[#666] p-2.5 border border-dashed border-(--ink-secondary)",
                className
            )}
        >
            {protocols.map((protocol) => (
                <div key={protocol.name}>
                    <span
                        className={cn(
                            protocol.status === "active" && "text-(--ink-primary)",
                            protocol.status === "inert" && "text-[#666]"
                        )}
                    >
                        [{protocol.status.toUpperCase()}]
                    </span>{" "}
                    {protocol.name}
                </div>
            ))}
        </div>
    );
}
