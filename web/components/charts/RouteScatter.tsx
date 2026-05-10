"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { RouteRow } from "@/lib/types";
import { COLORS, lateRateColor } from "@/lib/colors";

export function RouteScatter({ routes }: { routes: RouteRow[] }) {
  const data = routes.map((r) => ({
    x: r.avgDelivery,
    y: r.freightRatio * 100,
    z: r.gmv,
    route: r.route,
    lateRate: r.lateRate,
    fill: lateRateColor(r.lateRate),
  }));
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 8, right: 16, bottom: 30, left: 8 }}>
          <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name="Avg delivery (d)"
            stroke={COLORS.muted}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            tickLine={false}
            label={{
              value: "Avg delivery (days)",
              position: "insideBottom",
              offset: -16,
              fill: COLORS.muted,
              fontSize: 11,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            stroke={COLORS.muted}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            label={{
              value: "Freight ratio",
              angle: -90,
              position: "insideLeft",
              fill: COLORS.muted,
              fontSize: 11,
            }}
          />
          <ZAxis type="number" dataKey="z" range={[60, 700]} />
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
              if (name === "x") return [`${v.toFixed(1)}d`, "Avg delivery"] as [string, string];
              if (name === "y") return [`${v.toFixed(1)}%`, "Freight ratio"] as [string, string];
              if (name === "z")
                return [
                  new Intl.NumberFormat("en-US", { notation: "compact" }).format(v),
                  "GMV",
                ] as [string, string];
              return [String(value), String(name)] as [string, string];
            }}
            labelFormatter={() => ""}
          />
          <Scatter
            data={data}
            fillOpacity={0.7}
            shape={(props: { cx?: number; cy?: number; payload?: { fill: string } }) => {
              const { cx, cy, payload } = props;
              if (cx == null || cy == null) return <></>;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={8}
                  fill={payload?.fill ?? COLORS.primary}
                  fillOpacity={0.7}
                  stroke={payload?.fill ?? COLORS.primary}
                  strokeWidth={1.5}
                />
              );
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
