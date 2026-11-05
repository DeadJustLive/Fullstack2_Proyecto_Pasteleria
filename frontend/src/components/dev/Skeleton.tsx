import { cn } from "@/lib/utils";

interface SkeletonProps {
  elemento: string;
  responsable: string;
  className?: string;
}

export function Skeleton({ elemento, responsable, className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded border-2 border-dashed border-tertiary/30 bg-tertiary/5 p-6 text-center",
        className,
      )}
    >
      <span className="font-display text-sm font-semibold uppercase tracking-wide text-tertiary/70">
        {elemento}
      </span>
      <span className="font-body text-xs text-secondary">Responsable: {responsable}</span>
    </div>
  );
}
