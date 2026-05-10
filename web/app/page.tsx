import { PageHeader } from "@/components/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { KpiCard } from "@/components/KpiCard";
import { TrendChart } from "@/components/charts/TrendChart";
import { StateBars } from "@/components/charts/StateBars";
import { ImpactCard } from "@/components/charts/ImpactCard";
import {
  getKpi,
  getMonthlyTrend,
  getStateEfficiency,
  getCsat,
} from "@/lib/data";
import { formatCompact, formatNumber } from "@/lib/utils";

const monthLabel = (m: string | null) => {
  if (!m) return "—";
  const [y, mm] = m.split("-");
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(mm, 10)]} ${y}`;
};

export default function HomePage() {
  const kpi = getKpi();
  const trend = getMonthlyTrend();
  const states = getStateEfficiency();
  const csat = getCsat();

  return (
    <div>
      <PageHeader
        title="Logistics Summary"
        subtitle="Olist Brazil — Tổng quan hiệu suất giao hàng"
        rightSlot={
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--card)] px-4 py-2 text-xs text-[var(--muted-strong)]">
              {monthLabel(kpi.dateRange.from)} – {monthLabel(kpi.dateRange.to)}
            </div>
            <button className="rounded-lg bg-[var(--foreground)] px-4 py-2 text-xs font-semibold text-[var(--background)] transition hover:opacity-90">
              Xuất Report
            </button>
          </div>
        }
      />

      <div className="space-y-6 px-10 py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Tổng đơn hàng"
            value={formatNumber(kpi.totalOrders)}
            delta={kpi.deltas.totalOrders}
            deltaLabel="vs kỳ trước"
          />
          <KpiCard
            label="Tỷ lệ giao trễ"
            value={kpi.lateRatePct.toFixed(2)}
            unit="%"
            accent="danger"
            delta={kpi.deltas.lateRatePct}
            deltaLabel="Target: < 5%"
            deltaInvert
          />
          <KpiCard
            label="Thời gian giao TB"
            value={kpi.avgDeliveryDays.toFixed(1)}
            unit="d"
            delta={kpi.deltas.avgDeliveryDays}
            deltaLabel="Đang tối ưu"
            deltaInvert
          />
          <KpiCard
            label="Điểm đánh giá"
            value={kpi.avgReviewScore.toFixed(2)}
            unit="★"
            accent="success"
            delta={kpi.deltas.avgReviewScore}
            deltaLabel="CSAT level"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader
              title="Operational Trend"
              subtitle="Monthly order volume & fulfillment"
              action={
                <div className="flex items-center gap-3 text-[11px] text-[var(--muted-strong)]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                    VOLUME
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-[2px] w-3 bg-[var(--danger)]" />
                    LATE RATE
                  </span>
                </div>
              }
            />
            <CardBody>
              <TrendChart data={trend} />
              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-4">
                <Stat label="Peak month" value={formatPeak(trend)} />
                <Stat
                  label="Total orders"
                  value={formatCompact(trend.reduce((a, b) => a + b.orders, 0))}
                />
                <Stat
                  label="Avg late rate"
                  value={`${(trend.reduce((a, b) => a + b.lateRate, 0) / trend.length).toFixed(2)}%`}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="State Efficiency" subtitle="Top performing regions" />
            <CardBody>
              <StateBars data={states} />
            </CardBody>
          </Card>
        </div>

        <ImpactCard csat={csat} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </div>
      <div className="kpi-numeric mt-1 text-base font-semibold tracking-tight">
        {value}
      </div>
    </div>
  );
}

function formatPeak(data: { month: string; orders: number }[]) {
  if (!data.length) return "—";
  const peak = [...data].sort((a, b) => b.orders - a.orders)[0];
  const [y, mm] = peak.month.split("-");
  return `T${parseInt(mm, 10)}/${y.slice(2)}`;
}
