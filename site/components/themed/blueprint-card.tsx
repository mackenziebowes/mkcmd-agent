import { cn } from "@/lib/utils";

interface BlueprintCardProps {
    number: string;
    title: string;
    description: string;
    className?: string;
}

export function BlueprintCard({
    number,
    title,
    description,
    className,
}: BlueprintCardProps) {
    return (
        <div
            className={cn(
                "bg-(--paper) border border-(--ink-primary) p-5 relative z-[1] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[5px_5px_0px_rgba(61,90,254,0.1)",
                className
            )}
        >
            <div className="w-8 h-8 border border-(--ink-primary) rounded-full flex items-center justify-center mb-4 font-bold bg-white">
                {number}
            </div>
            <div className="text-lg mb-2.5 uppercase">{title}</div>
            <div className="text-sm leading-relaxed text-[#555]">
                {description}
            </div>
        </div>
    );
}

interface BlueprintCardGridProps {
    children: React.ReactNode;
    className?: string;
}

export function BlueprintCardGrid({
    children,
    className,
}: BlueprintCardGridProps) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-3 gap-8 relative before:content-[''] before:absolute before:top-1/2 before:left-0 before:w-full before:h-px before:border-t before:border-dashed before:border-(--ink-primary) before:z-0",
                className
            )}
        >
            {children}
        </div>
    );
}
