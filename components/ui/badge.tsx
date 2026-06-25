import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap [&>svg]:size-3 border",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-transparent",
        secondary: "bg-secondary text-secondary-foreground border-transparent",
        outline: "text-foreground border-border bg-card",
        muted: "bg-muted text-muted-foreground border-transparent",
        success: "bg-success/12 text-success border-success/20",
        warning: "bg-warning/12 text-warning border-warning/20",
        danger: "bg-destructive/12 text-destructive border-destructive/20",
        info: "bg-info/12 text-info border-info/20",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
