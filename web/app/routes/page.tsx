import { PageHeader } from "@/components/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { RouteHeatmap } from "@/components/charts/RouteHeatmap";
import { RouteTable } from "@/components/charts/RouteTable";
import { RouteScatter } from "@/components/charts/RouteScatter";
import { getRouteMatrix } from "@/lib/data";
import { formatCompact, formatNumber } from "@/lib/utils";

export const metadata = { title: "Logistics Tuyến — OLIST" };

export default function RoutesPage() {
  const matrix = getRouteMatrix();
  const totalGmv = matrix.topRoutes.reduce((a, r) => a + r.gmv, 0);
  const totalOrders = matrix.topRoutes.reduce((a, r) => a + r.orders, 0);
  const worstRoute = [...matrix.topRoutes].sort((a, b) => b.lateRate - a.lateRate)[0];

  return (
    <div>
      <PageHeader
        title="Route Intelligence"
        subtitle="Phân tích tuyến vận chuyển — GMV vs Late Rate"
        badge="DRILL-DOWN"
      />

      <div className="space-y-6 px-10 py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryStat
            label="GMV (top 15 routes)"
            value={`R$${formatCompact(totalGmv)}`}
            sub={`${formatNumber(totalOrders)} đơn`}
          />
          <SummaryStat
            label="Tuyến rủi ro nhất"
            value={worstRoute?.route ?? "—"}
            sub={`${worstRoute?.lateRate.toFixed(1)}% late`}
            danger
          />
          <SummaryStat
            label="Routes coverage"
            value={`${matrix.cells.length}`}
            sub={`${matrix.origins.length}×${matrix.destinations.length} states`}
          />
        </div>

        <Card>
          <CardHeader
            title="Origin × Destination Heatmap"
            subtitle="Click vào ô để drill-down"
          />
          <CardBody>
            <RouteHeatmap matrix={matrix} />
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_460px]">
          <Card>
            <CardHeader
              title="Top 15 Routes by GMV"
              subtitle="Bảng xếp hạng tuyến giá trị nhất"
            />
            <CardBody>
              <RouteTable routes={matrix.topRoutes} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Delivery vs Freight Ratio"
              subtitle="Bubble = GMV · Color = Late rate"
            />
            <CardBody>
              <RouteScatter routes={matrix.topRoutes} />
              <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
                Tuyến càng xa → freight ratio càng cao và delivery càng dài. Bóng đỏ
                lớn = tuyến giàu nhưng đang vận hành tệ — ưu tiên xử lý trước.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  sub,
  danger,
}: {
  label: string;
  value: string;
  sub: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </div>
      <div
        className={`kpi-numeric mt-2 text-2xl font-semibold tracking-tight ${danger ? "text-[var(--danger)]" : "text-[var(--foreground)]"}`}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-[var(--muted-strong)]">{sub}</div>
    </div>
  );
}
