"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AuditData } from "@/lib/types";
import { COLORS } from "@/lib/colors";

const monthLabel = (m: string) => {
  const [y, mm] = m.split("-");
  return `T${parseInt(mm, 10)}/${y.slice(2)}`;
};

export function MonthlyAuditChart({ data }: { data: AuditData["byMonth"] }) {
  const avg = data.reduce((a, b) => a + b.lateRate, 0) / Math.max(data.length, 1);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="lateGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.danger} stopOpacity={0.5} />
              <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
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
            stroke={COLORS.muted}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
            width={36}
          />
          <Tooltip
            cursor={{ stroke: COLORS.borderStrong, strokeDasharray: "3 3" }}
            contentStyle={{
              background: "var(--card-elevated)",
              border: "1px solid var(--border-strong)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(v) => monthLabel(String(v))}
            formatter={(value, name) => {
              const v = Number(value);
              if (name === "lateRate") return [`${v.toFixed(2)}%`, "Late rate"] as [string, string];
              if (name === "lateOrders") return [v.toLocaleString(), "Đơn trễ"] as [string, string];
              return [String(value), String(name)] as [string, string];
            }}
          />
          <ReferenceLine
            y={avg}
            stroke={COLORS.warning}
            strokeDasharray="6 4"
            label={{
              value: `TB ${avg.toFixed(2)}%`,
              position: "right",
              fill: COLORS.warning,
              fontSize: 10,
              fontFamily: "JetBrains Mono, monospace",
            }}
          />
          <Area
            type="monotone"
            dataKey="lateRate"
            stroke={COLORS.danger}
            strokeWidth={2.5}
            fill="url(#lateGradient)"
            dot={false}
            activeDot={{ r: 5, fill: COLORS.danger, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
