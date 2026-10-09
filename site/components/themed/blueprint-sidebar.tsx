import Link from "next/link";
import { cn } from "@/lib/utils";

interface BlueprintSidebarProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function BlueprintSidebar({
    title,
    children,
    className,
}: BlueprintSidebarProps) {
    return (
        <aside
            className={cn(
                "border-(--ink-primary) lg:border-r lg:pr-5",
                className
            )}
        >
            <div className="text-xs text-(--ink-secondary) mb-4 border-b border-(--ink-primary) pb-1">
                {title}
            </div>
            {children}
        </aside>
    );
}

interface BlueprintSidebarItemProps {
    children: React.ReactNode;
    active?: boolean;
    href?: string;
    onClick?: () => void;
    className?: string;
}

export function BlueprintSidebarItem({
    children,
    active,
    href,
    onClick,
    className,
}: BlueprintSidebarItemProps) {
    const classes = cn(
                "py-2.5 px-2.5 border border-transparent mb-2 cursor-pointer text-sm transition-all duration-200",
                "hover:bg-[#f0f4ff] hover:border-(--ink-secondary)",
                active && "bg-(--ink-primary) text-white border-(--ink-primary)",
                className
            );
    if (href) {
        return (
            <Link href={href} aria-current={active ? "page" : undefined} className={cn("block", classes)}>
                {children}
            </Link>
        );
    }
    return (
        <div onClick={onClick} className={classes}>
            {children}
        </div>
    );
}

interface BlueprintSidebarListProps {
    items: string[];
    activeItem?: string;
    onItemClick?: (item: string) => void;
    className?: string;
}

export function BlueprintSidebarList({
    items,
    activeItem,
    onItemClick,
    className,
}: BlueprintSidebarListProps) {
    return (
        <ul className={cn("list-none p-0 m-0", className)}>
            {items.map((item) => (
                <li key={item}>
                    <BlueprintSidebarItem
                        active={activeItem === item}
                        onClick={() => onItemClick?.(item)}
                    >
                        {item}
                    </BlueprintSidebarItem>
                </li>
            ))}
        </ul>
    );
}
