import { cn } from "@/lib/utils";

/** Soefia mark — an abstract upward "S" sweep in the brand navy/teal. */
export function SoefiaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn("size-7", className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path
        d="M22 11c-1.6-1.3-3.7-2-5.9-2-3.3 0-5.6 1.7-5.6 4.2 0 5.6 12 3 12 8.8 0 2.6-2.5 4.4-6 4.4-2.4 0-4.6-.8-6.2-2.2"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <SoefiaMark />
      <div className="leading-none">
        <div className="flex items-center gap-1.5">
          <span className="text-[0.95rem] font-semibold tracking-tight text-foreground">
            Soefia
          </span>
          <span className="text-[0.95rem] font-semibold tracking-tight text-primary">
            Deal Lab
          </span>
        </div>
        <div className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Workforce Readiness
        </div>
      </div>
    </div>
  );
}
