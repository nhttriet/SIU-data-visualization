"use client";

import {
  Bar,
  Cell,
  ComposedChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CsatData } from "@/lib/types";
import { COLORS } from "@/lib/colors";
import { formatCompact } from "@/lib/utils";

const ratingColor = (rating: number) => {
  if (rating >= 4.5) return COLORS.success;
  if (rating >= 4) return "#84cc16";
  if (rating >= 3) return COLORS.warning;
  if (rating >= 2) return "#f97316";
  return COLORS.danger;
};

export function DeliveryBucketChart({ data }: { data: CsatData["deliveryBuckets"] }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="bucket"
            stroke={COLORS.muted}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: COLORS.border }}
            label={{
              value: "Số ngày giao",
              position: "insideBottom",
              offset: -2,
              fill: COLORS.muted,
              fontSize: 11,
            }}
          />
          <YAxis
            yAxisId="orders"
            stroke={COLORS.muted}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCompact(v)}
            width={40}
          />
          <YAxis
            yAxisId="rating"
            orientation="right"
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            stroke={COLORS.muted}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "var(--card-elevated)",
              border: "1px solid var(--border-strong)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value, name) => {
              if (name === "orders")
                return [formatCompact(Number(value)), "Số đơn"] as [string, string];
              if (name === "avgReview")
                return [Number(value).toFixed(2), "CSAT TB"] as [string, string];
              return [String(value), String(name)] as [string, string];
            }}
          />
          <Bar yAxisId="orders" dataKey="orders" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={ratingColor(d.avgReview)} fillOpacity={0.85} />
            ))}
          </Bar>
          <Line
            yAxisId="rating"
            type="monotone"
            dataKey="avgReview"
            stroke={COLORS.warning}
            strokeWidth={2.5}
            dot={{ fill: COLORS.warning, r: 4, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
