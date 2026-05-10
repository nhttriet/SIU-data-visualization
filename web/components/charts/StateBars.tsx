"use client";

import type { StateRow } from "@/lib/types";
import { CHART_PALETTE } from "@/lib/colors";
import { formatNumber } from "@/lib/utils";

export function StateBars({ data, limit = 4 }: { data: StateRow[]; limit?: number }) {
  const top = data.slice(0, limit);
  const otherShare = data.slice(limit).reduce((acc, r) => acc + r.share, 0);
  const otherOrders = data.slice(limit).reduce((acc, r) => acc + r.orders, 0);
  const max = Math.max(...top.map((r) => r.share), otherShare);

  const rows = [
    ...top.map((r, i) => ({
      label: r.state,
      share: r.share,
      orders: r.orders,
      color: CHART_PALETTE[i % CHART_PALETTE.length],
      sub: r.state,
    })),
    {
      label: "Khác",
      share: otherShare,
      orders: otherOrders,
      color: "#475569",
      sub: "khác",
    },
  ];

  return (
    <div className="space-y-5">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-[var(--foreground)]">{r.label}</span>
            <span className="font-mono text-xs text-[var(--muted-strong)]">
              {r.share.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-1.5 overflow-hidden rounded-full bg-[var(--card-elevated)]">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all"
              style={{
                width: `${(r.share / max) * 100}%`,
                background: r.color,
              }}
            />
          </div>
          <div className="mt-1 text-[11px] text-[var(--muted)]">
            {formatNumber(r.orders)} đơn
          </div>
        </div>
      ))}
    </div>
  );
}
