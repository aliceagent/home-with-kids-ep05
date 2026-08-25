import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-1 w-full overflow-hidden rounded-full bg-white/10",
        className,
      )}
    >
      <div
        className="h-full bg-amber-400 transition-[width] duration-200"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
