import { cn } from "@/lib/utils";

interface BlueprintDocHeaderProps {
    title: string;
    statusPill?: React.ReactNode;
    metaData?: { label: string; value: string }[];
    className?: string;
}

export function BlueprintDocHeader({
    title,
    statusPill,
    metaData,
    className,
}: BlueprintDocHeaderProps) {
    return (
        <header
            className={cn(
                "flex flex-wrap gap-4 justify-between items-start mb-8 border-b-2 border-double border-(--ink-primary) pb-4",
                className
            )}
        >
            <div>
                <h2 className="m-0 text-2xl uppercase">{title}</h2>
                {statusPill}
            </div>
            {metaData && metaData.length > 0 && (
                <div className="text-left sm:text-right text-sm [overflow-wrap:anywhere]">
                    {metaData.map((item, i) => (
                        <div key={i}>
                            {item.label}: {item.value}
                        </div>
                    ))}
                </div>
            )}
        </header>
    );
}
