import { cn } from "@/lib/utils";

interface SceneWatermarkProps {
  className?: string;
}

/** Small credit in the top-left of the 4:3 scene frame */
export function SceneWatermark({ className }: SceneWatermarkProps) {
  return (
    <p
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-2 left-2 z-[50]",
        "rounded-sm bg-black/60 px-1.5 py-0.5",
        "font-sans text-[10px] font-medium leading-none tracking-wide text-white/90",
        "shadow-[0_1px_2px_rgba(0,0,0,0.65)]",
        className,
      )}
    >
      Jonathan Caras
    </p>
  );
}
