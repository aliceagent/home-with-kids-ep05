"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "default" | "secondary" | "ghost";
type Size = "default" | "sm" | "icon";

const variants: Record<Variant, string> = {
  default: "bg-amber-600 text-white hover:bg-amber-500",
  secondary: "bg-white/10 text-white hover:bg-white/20",
  ghost: "bg-transparent text-white/80 hover:bg-white/10 hover:text-white",
};

const sizes: Record<Size, string> = {
  default: "h-9 px-3",
  sm: "h-8 px-2.5 text-sm",
  icon: "size-9",
};

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition disabled:pointer-events-none disabled:opacity-30",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
