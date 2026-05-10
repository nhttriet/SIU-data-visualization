"use client";

import type { RouteRow } from "@/lib/types";
import { lateRateColor } from "@/lib/colors";
import { formatCompact, formatNumber } from "@/lib/utils";

export function RouteTable({ routes }: { routes: RouteRow[] }) {
  const max = Math.max(...routes.map((r) => r.gmv), 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
            <th className="px-3 py-2 font-medium">Tuyến</th>
            <th className="px-3 py-2 font-medium">Đơn</th>
            <th className="px-3 py-2 font-medium">GMV</th>
            <th className="px-3 py-2 font-medium">Late</th>
            <th className="px-3 py-2 font-medium">Avg delivery</th>
            <th className="px-3 py-2 font-medium">Freight</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((r) => {
            const color = lateRateColor(r.lateRate);
            return (
              <tr
                key={r.route}
                className="border-t border-[var(--border)] hover:bg-[var(--card-elevated)]"
              >
                <td className="px-3 py-2.5 font-mono text-xs font-medium text-[var(--foreground)]">
                  {r.route}
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-[var(--muted-strong)]">
                  {formatNumber(r.orders)}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="relative h-1.5 w-24 rounded-full bg-[var(--card-elevated)]">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-[var(--primary)]"
                        style={{ width: `${(r.gmv / max) * 100}%` }}
                      />
                    </div>
                    <span className="kpi-numeric text-xs">
                      R${formatCompact(r.gmv)}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className="kpi-numeric text-xs font-semibold"
                    style={{ color }}
                  >
                    {r.lateRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-[var(--muted-strong)]">
                  {r.avgDelivery.toFixed(1)}d
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-[var(--muted-strong)]">
                  {(r.freightRatio * 100).toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
