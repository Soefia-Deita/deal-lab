import * as React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/brand";

/** Shared app header (launcher + workspace). */
export function AppHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-md no-print">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-5">
        <Link href="/" className="shrink-0">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-2.5">
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
            <ShieldCheck className="size-3" />
            SOC 2-aware · Confidential
          </span>
          {children}
        </div>
      </div>
    </header>
  );
}
