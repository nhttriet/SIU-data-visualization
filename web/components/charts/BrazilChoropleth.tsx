"use client";

import { useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { ChoroplethRow } from "@/lib/types";
import { lateRateColor } from "@/lib/colors";

type Feature = {
  type: "Feature";
  geometry: GeoJSON.Geometry;
  properties: { sigla: string; name: string };
};

type FC = { type: "FeatureCollection"; features: Feature[] };

export function BrazilChoropleth({
  geo,
  data,
  metric = "lateRate",
}: {
  geo: FC;
  data: ChoroplethRow[];
  metric?: "lateRate" | "avgDelivery";
}) {
  const [hover, setHover] = useState<{ row: ChoroplethRow; x: number; y: number } | null>(
    null,
  );

  const lookup = useMemo(() => {
    const m = new Map<string, ChoroplethRow>();
    data.forEach((r) => m.set(r.state, r));
    return m;
  }, [data]);

  const width = 640;
  const height = 540;
  const projection = useMemo(
    () => geoMercator().fitSize([width, height], geo as GeoJSON.GeoJSON),
    [geo],
  );
  const pathGen = useMemo(() => geoPath(projection), [projection]);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <g>
          {geo.features.map((f) => {
            const sigla = f.properties.sigla;
            const row = lookup.get(sigla);
            const value = row
              ? metric === "lateRate"
                ? row.lateRate
                : row.avgDelivery
              : null;
            const fill = row
              ? metric === "lateRate"
                ? lateRateColor(row.lateRate)
                : deliveryColor(row.avgDelivery)
              : "#1f2a44";
            const d = pathGen(f as GeoJSON.Feature) ?? "";
            return (
              <path
                key={sigla}
                d={d}
                fill={fill}
                fillOpacity={row ? 0.78 : 0.25}
                stroke="#0a0e1a"
                strokeWidth={0.8}
                className="transition-opacity hover:opacity-100"
                style={{ cursor: row ? "pointer" : "default" }}
                onMouseMove={(e) => {
                  if (!row) return;
                  const rect = (e.target as SVGPathElement).ownerSVGElement!.getBoundingClientRect();
                  setHover({
                    row,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </g>
        <g>
          {geo.features.map((f) => {
            const sigla = f.properties.sigla;
            const row = lookup.get(sigla);
            if (!row || row.orders < 1500) return null;
            const centroid = pathGen.centroid(f as GeoJSON.Feature);
            return (
              <text
                key={`label-${sigla}`}
                x={centroid[0]}
                y={centroid[1]}
                textAnchor="middle"
                fontSize={9}
                fontFamily="JetBrains Mono, monospace"
                fill="#fff"
                fillOpacity={0.85}
                pointerEvents="none"
              >
                {sigla}
              </text>
            );
          })}
        </g>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-[var(--border-strong)] bg-[var(--card-elevated)] px-3 py-2 text-xs shadow-xl"
          style={{
            left: hover.x + 12,
            top: hover.y + 12,
            minWidth: 180,
          }}
        >
          <div className="mb-1 text-sm font-semibold text-[var(--foreground)]">
            {hover.row.state}
          </div>
          <div className="space-y-0.5 text-[var(--muted-strong)]">
            <Row label="Late rate" value={`${hover.row.lateRate.toFixed(2)}%`} />
            <Row label="Avg delivery" value={`${hover.row.avgDelivery.toFixed(1)} d`} />
            <Row label="Orders" value={hover.row.orders.toLocaleString()} />
            <Row
              label="CSAT"
              value={hover.row.avgReview ? `${hover.row.avgReview.toFixed(2)} ★` : "—"}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className="kpi-numeric font-medium text-[var(--foreground)]">
        {value}
      </span>
    </div>
  );
}

function deliveryColor(d: number) {
  if (d < 10) return "#10b981";
  if (d < 15) return "#84cc16";
  if (d < 20) return "#f59e0b";
  if (d < 25) return "#f97316";
  return "#ef4444";
}
