"use client";

import { cn } from "@/lib/utils";

export function Switch({
  id,
  checked,
  onCheckedChange,
  className,
}: {
  id?: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  className?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      data-slot="switch"
      data-checked={checked ? "" : undefined}
      data-unchecked={checked ? undefined : ""}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-[18.4px] w-[32px] shrink-0 items-center rounded-full border-2 transition",
        checked
          ? "border-emerald-200 bg-emerald-500"
          : "border-stone-500 bg-stone-700",
        className,
      )}
    >
      <span
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-white transition-transform",
          checked ? "translate-x-[calc(100%-2px)]" : "translate-x-0",
        )}
      />
    </button>
  );
}
