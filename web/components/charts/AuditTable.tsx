"use client";

import { useMemo, useState } from "react";
import type { AuditOrder } from "@/lib/types";
import { lateRateColor } from "@/lib/colors";
import { cn } from "@/lib/utils";

type SortKey = "delayDays" | "deliveryDays" | "review";

export function AuditTable({ rows }: { rows: AuditOrder[] }) {
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("delayDays");

  const states = useMemo(
    () => Array.from(new Set(rows.map((r) => r.state))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    let xs = filter ? rows.filter((r) => r.state === filter) : rows;
    xs = [...xs].sort((a, b) => {
      const av = (a[sortKey] ?? 0) as number;
      const bv = (b[sortKey] ?? 0) as number;
      return bv - av;
    });
    return xs;
  }, [rows, filter, sortKey]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("")}
          className={cn(
            "rounded-md border px-3 py-1.5 text-xs transition-colors",
            !filter
              ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
              : "border-[var(--border-strong)] text-[var(--muted-strong)] hover:bg-[var(--card-elevated)]",
          )}
        >
          Tất cả ({rows.length})
        </button>
        {states.slice(0, 10).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-md border px-3 py-1.5 font-mono text-xs uppercase transition-colors",
              filter === s
                ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                : "border-[var(--border-strong)] text-[var(--muted-strong)] hover:bg-[var(--card-elevated)]",
            )}
          >
            {s}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 rounded-md border border-[var(--border-strong)] bg-[var(--card-elevated)] p-1 text-[10px] uppercase">
          <SortBtn active={sortKey === "delayDays"} onClick={() => setSortKey("delayDays")}>
            Delay
          </SortBtn>
          <SortBtn active={sortKey === "deliveryDays"} onClick={() => setSortKey("deliveryDays")}>
            Delivery
          </SortBtn>
          <SortBtn active={sortKey === "review"} onClick={() => setSortKey("review")}>
            Review
          </SortBtn>
        </div>
      </div>

      <div className="max-h-[440px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[var(--card)]">
            <tr className="text-left text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
              <th className="px-3 py-2 font-medium">Order</th>
              <th className="px-3 py-2 font-medium">State</th>
              <th className="px-3 py-2 font-medium">City</th>
              <th className="px-3 py-2 font-medium">Purchase</th>
              <th className="px-3 py-2 font-medium">Delivery</th>
              <th className="px-3 py-2 font-medium">Delay</th>
              <th className="px-3 py-2 font-medium">Review</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.orderId}
                className="border-t border-[var(--border)] hover:bg-[var(--card-elevated)]"
              >
                <td className="px-3 py-2 font-mono text-[11px] text-[var(--muted-strong)]">
                  {r.orderId}…
                </td>
                <td className="px-3 py-2 font-mono text-xs uppercase text-[var(--foreground)]">
                  {r.state}
                </td>
                <td className="px-3 py-2 capitalize text-xs text-[var(--muted-strong)]">
                  {r.city}
                </td>
                <td className="px-3 py-2 font-mono text-[11px] text-[var(--muted)]">
                  {r.purchase}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-[var(--muted-strong)]">
                  {r.deliveryDays?.toFixed(1) ?? "—"} d
                </td>
                <td className="px-3 py-2">
                  <span
                    className="kpi-numeric text-xs font-semibold"
                    style={{ color: lateRateColor(Math.min(((r.delayDays ?? 0) / 30) * 100, 100)) }}
                  >
                    +{r.delayDays?.toFixed(1) ?? "—"} d
                  </span>
                </td>
                <td className="px-3 py-2">
                  <ReviewBadge value={r.review} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1 font-mono tracking-wider transition-colors",
        active
          ? "bg-[var(--primary)] text-white"
          : "text-[var(--muted-strong)] hover:text-[var(--foreground)]",
      )}
    >
      {children}
    </button>
  );
}

function ReviewBadge({ value }: { value: number | null }) {
  if (value == null) return <span className="text-xs text-[var(--muted)]">—</span>;
  const color =
    value >= 4 ? "var(--success)" :
    value >= 3 ? "var(--warning)" : "var(--danger)";
  return (
    <span
      className="kpi-numeric inline-flex items-center gap-1 text-xs font-semibold"
      style={{ color }}
    >
      {value.toFixed(1)} ★
    </span>
  );
}
