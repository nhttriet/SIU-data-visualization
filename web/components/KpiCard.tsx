import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  deltaInvert?: boolean;
  accent?: "default" | "danger" | "success" | "warning";
}

const ACCENT: Record<NonNullable<Props["accent"]>, string> = {
  default: "text-[var(--foreground)]",
  danger: "text-[var(--danger)]",
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
};

export function KpiCard({
  label,
  value,
  unit,
  delta,
  deltaLabel,
  deltaInvert,
  accent = "default",
}: Props) {
  const showDelta = typeof delta === "number";
  const positive = (delta ?? 0) >= 0;
  const good = deltaInvert ? !positive : positive;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span
          className={cn(
            "kpi-numeric text-[44px] font-semibold leading-none tracking-tight",
            ACCENT[accent],
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="kpi-numeric text-lg font-medium text-[var(--muted)]">
            {unit}
          </span>
        )}
      </div>
      {showDelta && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-mono font-semibold",
              good ? "text-[var(--success)]" : "text-[var(--danger)]",
            )}
          >
            {positive ? (
              <ArrowUp className="h-3 w-3" strokeWidth={3} />
            ) : (
              <ArrowDown className="h-3 w-3" strokeWidth={3} />
            )}
            {Math.abs(delta!).toFixed(delta && Math.abs(delta) < 1 ? 2 : 1)}%
          </span>
          {deltaLabel && (
            <span className="text-[var(--muted)]">{deltaLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
