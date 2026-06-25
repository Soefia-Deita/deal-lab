import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<HTMLLabelElement, React.ComponentProps<"label">>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium text-foreground leading-none mb-1.5 inline-block",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
