import { cn } from "@/lib/utils";

interface BlueprintContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function BlueprintContainer({
    children,
    className,
}: BlueprintContainerProps) {
    return (
        <div
            className={cn(
                "max-w-[1440px] mx-2.5 my-2.5 md:mx-10 md:my-10 border-2 border-(--ink-primary) p-2.5 md:p-5 lg:p-10 relative bg-(--paper) shadow-[10px_10px_0px_rgba(61,90,254,0.1)] min-h-[90vh] lg:mx-auto",
                className
            )}
        >
            <Crosshairs />
            <div className="border border-(--ink-primary) p-5 h-full relative">
                <RulerX />
                {children}
            </div>
        </div>
    );
}

function Crosshairs() {
    const positions = [
        "-top-2.5 -left-2.5",
        "-top-2.5 -right-[.75rem]",
        "-bottom-[.75rem] -left-2.5",
        "-bottom-[.75rem] -right-[.75rem]",
    ];
  const base = "absolute w-5 h-5 before:content-[''] before:absolute before:left-[0.5rem] before:top-0 before:w-0.5 before:h-5 before:bg-(--ink-primary) after:content-[''] after:absolute after:top-[0.5rem] after:left-0 after:h-0.5 after:w-5 after:bg-(--ink-primary)";
    return (
        <>
        {positions.map((pos, i) => {
         return <div
            key={i}
            className={cn(
              base,
              pos
            )}
            aria-hidden
          />
        })}
        </>
    );
}

function RulerX() {
    return (
        <div
            className="absolute top-0 left-0 w-full h-2.5 border-b border-(--ink-primary)"
            style={{
                background:
                    "repeating-linear-gradient(90deg, var(--ink-primary) 0 1px, transparent 1px 10px, var(--ink-primary) 10px 11px, transparent 11px 20px)",
            }}
            aria-hidden
        />
    );
}
