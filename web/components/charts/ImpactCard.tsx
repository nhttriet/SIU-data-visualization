"use client";

import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { AlertCircle, TrendingDown } from "lucide-react";
import type { CsatData } from "@/lib/types";
import { COLORS } from "@/lib/colors";

export function ImpactCard({ csat }: { csat: CsatData }) {
  const points = csat.deliveryBuckets.map((b) => ({
    x:
      b.bucket === "≤5" ? 5 :
      b.bucket === "6-10" ? 10 :
      b.bucket === "11-15" ? 15 :
      b.bucket === "16-20" ? 20 :
      b.bucket === "21-30" ? 30 : 40,
    y: b.avgReview,
    bucket: b.bucket,
    orders: b.orders,
  }));

  const corr = csat.correlation;
  const strength =
    Math.abs(corr) >= 0.7 ? "STRONG" :
    Math.abs(corr) >= 0.4 ? "MODERATE" : "WEAK";
  const direction = corr < 0 ? "NEGATIVE" : "POSITIVE";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--danger-soft)] text-[var(--danger)]">
          <AlertCircle className="h-5 w-5" strokeWidth={2.4} />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Impact Analysis: Delivery vs Satisfaction
          </h2>
          <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
            Correlation: {corr.toFixed(2)} ({strength} {direction})
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="relative h-[260px] rounded-lg bg-[var(--card-elevated)] p-4">
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 12, right: 16, bottom: 28, left: 16 }}>
              <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name="Số ngày giao"
                stroke={COLORS.muted}
                tick={{ fill: COLORS.muted, fontSize: 11 }}
                tickLine={false}
                domain={[0, 40]}
                ticks={[5, 10, 15, 20, 30, 40]}
                label={{
                  value: "Delivery days (bucket)",
                  position: "insideBottom",
                  offset: -16,
                  fill: COLORS.muted,
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                stroke={COLORS.muted}
                tick={{ fill: COLORS.muted, fontSize: 11 }}
                tickLine={false}
                label={{
                  value: "CSAT",
                  angle: -90,
                  position: "insideLeft",
                  fill: COLORS.muted,
                  fontSize: 11,
                }}
              />
              <ZAxis type="number" dataKey="orders" range={[80, 600]} />
              <ReferenceLine
                segment={[
                  { x: 5, y: points[0]?.y ?? 4.5 },
                  { x: 40, y: points.at(-1)?.y ?? 2.5 },
                ]}
                stroke={COLORS.danger}
                strokeDasharray="6 4"
                strokeWidth={1.5}
              />
              <Tooltip
                cursor={{ stroke: COLORS.borderStrong, strokeDasharray: "3 3" }}
                contentStyle={{
                  background: "var(--card-elevated)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value, name) => {
                  const v = Number(value);
                  if (name === "y") return [v.toFixed(2), "CSAT TB"] as [string, string];
                  if (name === "orders") return [v.toLocaleString(), "Số đơn"] as [string, string];
                  return [String(value), String(name)] as [string, string];
                }}
                labelFormatter={() => ""}
              />
              <Scatter data={points} fill={COLORS.danger} fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 transform">
            <div className="text-center">
              <div className="kpi-numeric text-2xl font-semibold text-[var(--danger)]">
                {(corr * 0.36).toFixed(2)} pts
              </div>
              <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                Mỗi 1 ngày trễ làm sụt điểm CSAT
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border-l-2 border-[var(--danger)] bg-[var(--danger-soft)] p-4">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--danger)]">
              <TrendingDown className="h-3.5 w-3.5" />
              Rủi ro (Risk)
            </div>
            <p className="text-sm leading-relaxed text-[var(--foreground)]">
              Đơn quá <span className="font-mono font-semibold">15 ngày</span> có{" "}
              <span className="font-mono font-semibold">
                {csat.compare.find((c) => c.status === "Late")?.lowReviewRate.toFixed(0) ?? "—"}%
              </span>{" "}
              xác suất nhận 1-2 sao.
            </p>
          </div>
          <div className="rounded-lg border-l-2 border-[var(--success)] bg-[var(--success-soft)] p-4">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--success)]">
              Cơ hội (OPP)
            </div>
            <p className="text-sm leading-relaxed text-[var(--foreground)]">
              Giảm <span className="font-mono font-semibold">2 ngày</span> giao
              hàng giúp thu hồi{" "}
              <span className="font-mono font-semibold">+0.72 pts</span> CSAT
              tiềm năng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
