import Link from "next/link";
import { cn } from "@/lib/utils";

interface BlueprintButtonProps {
    children: React.ReactNode;
    figLabel?: string;
    href?: string;
    onClick?: () => void;
    className?: string;
}

export function BlueprintButton({
    children,
    figLabel,
    href,
    onClick,
    className,
}: BlueprintButtonProps) {
    const classes = cn(
                "inline-block mt-8 bg-transparent text-(--ink-primary) border-2 border-(--ink-primary) px-10 py-4 uppercase font-mono text-base cursor-pointer relative transition-all duration-200 hover:bg-(--ink-primary) hover:text-white",
                className
            );
    const label = figLabel && (
        <span className="absolute -top-5 left-0 text-xs text-(--ink-secondary)">{figLabel}</span>
    );
    if (href) {
        return (
            <Link href={href} className={classes}>
                {label}
                {children}
            </Link>
        );
    }
    return (
        <button onClick={onClick} className={classes}>
            {label}
            {children}
        </button>
    );
}
