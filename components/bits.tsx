import * as React from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

/** Small uppercase section eyebrow. */
export function SectionLabel({
  children,
  className,
  icon: Icon,
}: {
  children: React.ReactNode;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
        className
      )}
    >
      {Icon ? <Icon className="size-3.5" /> : null}
      {children}
    </div>
  );
}

/** Initials avatar chip. */
export function Avatar({
  name,
  className,
  highlight,
}: {
  name: string;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-semibold",
        highlight
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground",
        className
      )}
    >
      {initials(name)}
    </span>
  );
}

/** A labeled metric block. */
export function Stat({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold tracking-tight tnum">{value}</div>
      {sub ? <div className="text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}
