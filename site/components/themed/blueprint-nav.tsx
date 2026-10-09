import { cn } from "@/lib/utils";

interface BlueprintNavProps {
    brand: string;
    subtitle?: string;
    metadata?: { label: string; value: string }[];
    className?: string;
}

export function BlueprintNav({
    brand,
    subtitle,
    metadata,
    className,
}: BlueprintNavProps) {
    return (
        <nav
            className={cn(
                "flex max-lg:flex-col justify-between items-end border-b border-(--ink-primary) pb-5 mb-15",
                className
            )}
        >
            <div className="border border-(--ink-primary) max-lg:px-2.5 px-5 py-2.5 bg-background relative max-lg:w-full">
                <h1 className="text-2xl md:text-3xl xl:text-4xl m-0 leading-none uppercase tracking-widest whitespace-nowrap">
                    {brand}
                </h1>
                {subtitle && (
                    <div className="text-xs mt-1">{subtitle}</div>
                )}
                <div
                    className="absolute top-1 left-1 w-full h-full border border-(--ink-secondary) -z-10"
                    aria-hidden
                />
            </div>

            {metadata && metadata.length > 0 && (
                <div className="text-xs text-left w-full lg:text-right opacity-80 leading-relaxed">
                    {metadata.map((item, i) => (
                        <div key={i}>
                            {item.label}: {item.value}
                        </div>
                    ))}
                </div>
            )}
        </nav>
    );
}
