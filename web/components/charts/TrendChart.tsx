"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyPoint } from "@/lib/types";
import { COLORS } from "@/lib/colors";
import { formatCompact } from "@/lib/utils";

const monthLabel = (m: string) => {
  const [y, mm] = m.split("-");
  return `T${parseInt(mm, 10)}/${y.slice(2)}`;
};

export function TrendChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.45} />
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={COLORS.border}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tickFormatter={monthLabel}
            stroke={COLORS.muted}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: COLORS.border }}
            interval={Math.max(0, Math.floor(data.length / 8))}
          />
          <YAxis
            yAxisId="orders"
            stroke={COLORS.muted}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCompact(v)}
            width={48}
          />
          <YAxis
            yAxisId="late"
            orientation="right"
            stroke={COLORS.muted}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: COLORS.borderStrong, strokeDasharray: "3 3" }}
            contentStyle={{
              background: "var(--card-elevated)",
              border: "1px solid var(--border-strong)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: COLORS.muted, marginBottom: 4 }}
            labelFormatter={(v) => monthLabel(String(v))}
            formatter={(value, name) => {
              const v = Number(value);
              if (name === "orders") return [formatCompact(v), "Đơn hàng"] as [string, string];
              if (name === "lateRate") return [`${v.toFixed(1)}%`, "Late rate"] as [string, string];
              return [String(value), String(name)] as [string, string];
            }}
          />
          <Area
            yAxisId="orders"
            type="monotone"
            dataKey="orders"
            stroke={COLORS.primary}
            strokeWidth={2.5}
            fill="url(#orderGradient)"
            dot={false}
            activeDot={{ r: 5, fill: COLORS.primary, strokeWidth: 0 }}
          />
          <Line
            yAxisId="late"
            type="monotone"
            dataKey="lateRate"
            stroke={COLORS.danger}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
