"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps extends Omit<ButtonProps, "children"> {
  value: string;
  label?: string;
  toastMessage?: string;
  children?: React.ReactNode;
}

export function CopyButton({
  value,
  label = "Copy",
  toastMessage = "Copied to clipboard",
  children,
  variant = "outline",
  size = "sm",
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    toast.success(toastMessage);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Button variant={variant} size={size} onClick={onCopy} className={cn(className)} {...props}>
      {copied ? <Check className="text-success" /> : <Copy />}
      {children ?? (copied ? "Copied" : label)}
    </Button>
  );
}
