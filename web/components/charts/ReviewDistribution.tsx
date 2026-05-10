"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CsatCompare } from "@/lib/types";
import { COLORS } from "@/lib/colors";

export function ReviewDistribution({ compare }: { compare: CsatCompare[] }) {
  const late = compare.find((c) => c.status === "Late");
  const ontime = compare.find((c) => c.status !== "Late");
  if (!late || !ontime) return null;

  const data = [1, 2, 3, 4, 5].map((star) => ({
    star: `${star}★`,
    Late:
      ((late.distribution[String(star)] ?? 0) / late.numOrders) * 100,
    "On-time":
      ((ontime.distribution[String(star)] ?? 0) / ontime.numOrders) * 100,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="star"
            stroke={COLORS.muted}
            tick={{ fill: COLORS.muted, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: COLORS.border }}
          />
          <YAxis
            stroke={COLORS.muted}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
            width={40}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "var(--card-elevated)",
              border: "1px solid var(--border-strong)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value, name) => [
              `${Number(value).toFixed(1)}%`,
              String(name),
            ] as [string, string]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: COLORS.muted, paddingTop: 4 }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="On-time" fill={COLORS.success} radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS.success} />
            ))}
          </Bar>
          <Bar dataKey="Late" fill={COLORS.danger} radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS.danger} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
