import { contentConfig } from "@/lib/contentConfig";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BlueprintFooterProps {
    project: string;
    drawnBy?: string;
    date?: string;
    revision?: string;
    sheet: string;
    checkedBy?: string;
    disclaimer?: string;
    copyright?: string;
    className?: string;
}

export function BlueprintFooter({
    project,
    drawnBy = "MPB",
    date,
    revision,
    sheet,
    checkedBy = "MPB",
    disclaimer = "ALL DIMENSIONS IN PIXELS UNLESS OTHERWISE NOTED. DO NOT SCALE DRAWING.",
    copyright,
    className,
}: BlueprintFooterProps) {
    return (
        <footer
            className={cn(
                "mt-20 border-t-2 border-(--ink-primary) grid grid-cols-1 lg:grid-cols-4 bg-background",
                className
            )}
        >
            <div className="border-r border-b border-(--ink-primary) p-2.5 lg:col-span-2">
                <span className="block text-[0.6rem] uppercase border-(--ink-secondary) mb-1">
                    PROJECT
                </span>
          <Link href={contentConfig.production_url}><span className="text-sm font-bold">{project}</span></Link>
            </div>
            <div className="border-r border-b border-(--ink-primary) p-2.5">
                <span className="block text-[0.6rem] uppercase border-(--ink-secondary) mb-1">
                    DRAWN BY
                </span>
                <span className="text-sm font-bold">{drawnBy}</span>
            </div>
            <div className="border-b border-(--ink-primary) p-2.5">
                <span className="block text-[0.6rem] uppercase border-(--ink-secondary) mb-1">
                    DATE
                </span>
                <span className="text-sm font-bold">{date || new Date().toISOString().split("T")[0]}</span>
            </div>
            <div className="border-r border-b border-(--ink-primary) p-2.5">
                <span className="block text-[0.6rem] uppercase border-(--ink-secondary) mb-1">
                    REVISION
                </span>
                <span className="text-sm font-bold">{revision ?? contentConfig.version}</span>
            </div>
            <div className="border-r border-b border-(--ink-primary) p-2.5">
                <span className="block text-[0.6rem] uppercase border-(--ink-secondary) mb-1">
                    SHEET
                </span>
                <span className="text-sm font-bold">{sheet}</span>
            </div>
            <div className="border-b p-2.5 lg:col-span-2">
                <span className="block text-[0.6rem] uppercase border-(--ink-secondary) mb-1">
                    CHECKED BY
                </span>
                <span className="text-sm font-bold">{checkedBy}</span>
            </div>
            <div className="border-r border-b border-(--ink-primary) p-2.5 lg:col-span-2">
                <span className="block text-[0.6rem] uppercase border-(--ink-secondary) mb-1">
                  SOURCE CODE
                </span>
              <Link href={contentConfig.githubRepo}><span className="text-sm font-bold">Github</span></Link>
            </div>
            <div className="border-b border-(--ink-primary) p-2.5 lg:col-span-2">
                <span className="block text-[0.6rem] uppercase border-(--ink-secondary) mb-1">
                  REGISTRY
                </span>
              {contentConfig.npmPublished ? (
                <Link href={contentConfig.npmPage}><span className="text-sm font-bold">NPM</span></Link>
              ) : (
                <span className="text-sm font-bold">NPM: PENDING</span>
              )}
            </div>
            <div className="lg:col-span-4 flex max-lg:flex-col lg:justify-between lg:items-center p-2.5">
                <span className="text-xs">{disclaimer}</span>
                <Link href="https://mackenziebowes.com"><span className="font-bold">{copyright ?? contentConfig.copyright}</span></Link>
            </div>
        </footer>
    );
}
