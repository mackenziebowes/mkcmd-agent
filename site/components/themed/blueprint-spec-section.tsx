import { cn } from "@/lib/utils";

interface BlueprintSpecSectionProps {
    label: string;
    children: React.ReactNode;
    className?: string;
}

export function BlueprintSpecSection({
    label,
    children,
    className,
}: BlueprintSpecSectionProps) {
    return (
        <section className={cn("mb-10", className)}>
            <div className="text-[0.7rem] text-(--ink-secondary) uppercase mb-2.5 flex items-center after:content-[''] after:flex-1 after:h-px after:bg-(--grid-line) after:ml-2.5">
                {label}
            </div>
            {children}
        </section>
    );
}
