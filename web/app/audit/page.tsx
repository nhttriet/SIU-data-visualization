import { readFileSync } from "fs";
import { join } from "path";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { BrazilChoropleth } from "@/components/charts/BrazilChoropleth";
import { MonthlyAuditChart } from "@/components/charts/MonthlyAuditChart";
import { AuditTable } from "@/components/charts/AuditTable";
import { getAudit, getChoropleth } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Báo Cáo Kiểm Toán — OLIST" };

function loadGeo() {
  const p = join(process.cwd(), "public", "geo", "brazil-states.json");
  return JSON.parse(readFileSync(p, "utf-8"));
}

export default function AuditPage() {
  const audit = getAudit();
  const choropleth = getChoropleth();
  const geo = loadGeo();

  const m = audit.metrics;

  return (
    <div>
      <PageHeader
        title="Audit Report"
        subtitle="Kiểm toán giao hàng — anomaly, geo distribution"
        badge="AUDIT"
      />

      <div className="space-y-6 px-10 py-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <AuditMetric label="Đơn đã giao" value={formatNumber(Math.round(m.num_delivered_orders ?? 0))} />
          <AuditMetric
            label="Avg delivery"
            value={`${(m.avg_delivery_days ?? 0).toFixed(1)} d`}
          />
          <AuditMetric
            label="Late rate"
            value={`${((m.late_delivery_rate ?? 0) * 100).toFixed(2)}%`}
            danger
          />
          <AuditMetric
            label="Đơn > 60 ngày"
            value={formatNumber(Math.round(m.delivery_over_60_days ?? 0))}
            danger
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_460px]">
          <Card>
            <CardHeader
              title="Late Rate by State"
              subtitle="Choropleth Brazil — hover để xem chi tiết"
            />
            <CardBody>
              <BrazilChoropleth geo={geo} data={choropleth} metric="lateRate" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Anomaly Timeline"
              subtitle="Late rate theo tháng + trung bình"
            />
            <CardBody>
              <MonthlyAuditChart data={audit.byMonth} />
              <div className="mt-4 space-y-2">
                <AnomalyHighlight data={audit.byMonth} />
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader
            title={`Top ${audit.topLateOrders.length} đơn vi phạm SLA`}
            subtitle="Danh sách đơn trễ nhất — sortable & filterable"
            action={
              <button className="rounded-lg border border-[var(--border-strong)] bg-[var(--card-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--muted-strong)] transition hover:text-[var(--foreground)]">
                Export CSV
              </button>
            }
          />
          <CardBody>
            <AuditTable rows={audit.topLateOrders} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function AuditMetric({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </div>
      <div
        className={`kpi-numeric mt-2 text-3xl font-semibold tracking-tight ${danger ? "text-[var(--danger)]" : "text-[var(--foreground)]"}`}
      >
        {value}
      </div>
    </div>
  );
}

function AnomalyHighlight({ data }: { data: { month: string; lateRate: number }[] }) {
  if (data.length === 0) return null;
  const peak = [...data].sort((a, b) => b.lateRate - a.lateRate)[0];
  const trough = [...data].sort((a, b) => a.lateRate - b.lateRate)[0];
  const fmt = (m: string) => {
    const [y, mm] = m.split("-");
    return `T${parseInt(mm, 10)}/${y.slice(2)}`;
  };
  return (
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div className="rounded-md border-l-2 border-[var(--danger)] bg-[var(--danger-soft)] p-2.5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--danger)]">
          Đỉnh trễ
        </div>
        <div className="kpi-numeric mt-1 text-base font-semibold text-[var(--foreground)]">
          {fmt(peak.month)} · {peak.lateRate.toFixed(1)}%
        </div>
      </div>
      <div className="rounded-md border-l-2 border-[var(--success)] bg-[var(--success-soft)] p-2.5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--success)]">
          Tốt nhất
        </div>
        <div className="kpi-numeric mt-1 text-base font-semibold text-[var(--foreground)]">
          {fmt(trough.month)} · {trough.lateRate.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
