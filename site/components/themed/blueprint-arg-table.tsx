import { cn } from "@/lib/utils";

interface BlueprintArgTableProps {
    headers: string[];
    rows: Record<string, React.ReactNode>[];
    className?: string;
}

export function BlueprintArgTable({
    headers,
    rows,
    className,
}: BlueprintArgTableProps) {
    return (
        <table
            className={cn(
                "w-full border-collapse text-sm",
                className
            )}
        >
            <thead>
                <tr>
                    {headers.map((header) => (
                        <th
                            key={header}
                            className="text-left border-b border-(--ink-primary) p-2 text-(--ink-secondary) font-normal"
                        >
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr key={i}>
                        {headers.map((header) => (
                            <td
                                key={header}
                                className="p-3 border-b border-dashed border-(--grid-line)"
                            >
                                {row[header]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
