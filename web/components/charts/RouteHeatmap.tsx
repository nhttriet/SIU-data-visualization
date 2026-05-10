"use client";

import { useMemo, useState } from "react";
import type { RouteMatrix, RouteCell } from "@/lib/types";
import { COLORS, lateRateColor } from "@/lib/colors";
import { formatCompact } from "@/lib/utils";

export function RouteHeatmap({ matrix }: { matrix: RouteMatrix }) {
  const [active, setActive] = useState<RouteCell | null>(null);

  const lookup = useMemo(() => {
    const m = new Map<string, RouteCell>();
    matrix.cells.forEach((c) => m.set(`${c.o}|${c.d}`, c));
    return m;
  }, [matrix]);

  const maxGmv = useMemo(
    () => Math.max(...matrix.cells.map((c) => c.gmv), 1),
    [matrix],
  );

  const origins = matrix.origins;
  const destinations = matrix.destinations;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Origin <span className="text-[var(--muted-strong)]">↓</span> × Destination{" "}
          <span className="text-[var(--muted-strong)]">→</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[var(--muted-strong)]">
          <Legend color={COLORS.success} label="< 6%" />
          <Legend color={COLORS.warning} label="6–12%" />
          <Legend color="#f97316" label="12–20%" />
          <Legend color={COLORS.danger} label="> 20%" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-grid gap-[2px]" style={{
          gridTemplateColumns: `64px repeat(${destinations.length}, 36px)`,
        }}>
          <div />
          {destinations.map((d) => (
            <div
              key={d}
              className="flex h-7 items-end justify-center text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]"
            >
              {d}
            </div>
          ))}

          {origins.map((o) => (
            <RouteRow
              key={o}
              origin={o}
              destinations={destinations}
              lookup={lookup}
              maxGmv={maxGmv}
              setActive={setActive}
            />
          ))}
        </div>
      </div>

      {active && (
        <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--card-elevated)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-[var(--foreground)]">
              Tuyến {active.o} → {active.d}
            </div>
            <button
              onClick={() => setActive(null)}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
            <DetailStat label="GMV" value={`R$${formatCompact(active.gmv)}`} />
            <DetailStat label="Đơn hàng" value={formatCompact(active.orders)} />
            <DetailStat
              label="Late rate"
              value={`${active.lateRate.toFixed(1)}%`}
              color={lateRateColor(active.lateRate)}
            />
            <DetailStat
              label="Avg delivery"
              value={`${active.avgDelivery.toFixed(1)}d`}
            />
            <DetailStat
              label="Freight ratio"
              value={`${(active.freightRatio * 100).toFixed(1)}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RouteRow({
  origin,
  destinations,
  lookup,
  maxGmv,
  setActive,
}: {
  origin: string;
  destinations: string[];
  lookup: Map<string, RouteCell>;
  maxGmv: number;
  setActive: (c: RouteCell | null) => void;
}) {
  return (
    <>
      <div className="flex h-9 items-center justify-end pr-2 font-mono text-[11px] uppercase tracking-wider text-[var(--muted-strong)]">
        {origin}
      </div>
      {destinations.map((d) => {
        const cell = lookup.get(`${origin}|${d}`);
        if (!cell) {
          return (
            <div
              key={d}
              className="h-9 rounded-sm border border-dashed border-[var(--border)]/60"
            />
          );
        }
        const intensity = Math.min(1, cell.gmv / maxGmv);
        const lateColor = lateRateColor(cell.lateRate);
        return (
          <button
            key={d}
            onMouseEnter={() => setActive(cell)}
            onClick={() => setActive(cell)}
            className="group relative h-9 rounded-sm transition-transform hover:scale-110"
            style={{
              background: `${lateColor}${Math.floor(0.18 + intensity * 0.6 * 255).toString(16).padStart(2, "0")}`,
              border: `1px solid ${lateColor}`,
            }}
            title={`${origin} → ${d} | ${cell.lateRate.toFixed(1)}% late | ${formatCompact(cell.gmv)} GMV`}
          >
            <div
              className="absolute inset-0 rounded-sm opacity-0 ring-2 ring-white/30 transition-opacity group-hover:opacity-100"
            />
          </button>
        );
      })}
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-3 w-3 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

function DetailStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </div>
      <div
        className="kpi-numeric mt-1 text-base font-semibold"
        style={{ color: color ?? "var(--foreground)" }}
      >
        {value}
      </div>
    </div>
  );
}
