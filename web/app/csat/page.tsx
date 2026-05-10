import { PageHeader } from "@/components/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { ReviewDistribution } from "@/components/charts/ReviewDistribution";
import { DeliveryBucketChart } from "@/components/charts/DeliveryBucketChart";
import { getCsat, getCategories } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { lateRateColor } from "@/lib/colors";

export const metadata = { title: "Đánh Giá CSAT — OLIST" };

export default function CsatPage() {
  const csat = getCsat();
  const categories = getCategories();
  const late = csat.compare.find((c) => c.status === "Late")!;
  const ontime = csat.compare.find((c) => c.status !== "Late")!;
  const gap = ontime.avgReview - late.avgReview;

  const sensitiveCategories = [...categories]
    .sort((a, b) => b.lateRate - a.lateRate)
    .slice(0, 8);

  return (
    <div>
      <PageHeader
        title="Voice of Customer"
        subtitle="CSAT — Phân tích đánh giá khách hàng vs. logistics"
        badge="REVIEW INTEL"
      />

      <div className="space-y-6 px-10 py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <CompareCard
            label="Trễ hẹn"
            avg={late.avgReview}
            count={late.numOrders}
            lowRate={late.lowReviewRate}
            color="var(--danger)"
          />
          <CompareCard
            label="Đúng / sớm hẹn"
            avg={ontime.avgReview}
            count={ontime.numOrders}
            lowRate={ontime.lowReviewRate}
            color="var(--success)"
          />
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Khoảng cách CSAT
            </div>
            <div className="kpi-numeric mt-2 text-[40px] font-semibold leading-none tracking-tight text-[var(--warning)]">
              −{gap.toFixed(2)}
            </div>
            <div className="mt-2 text-xs text-[var(--muted-strong)]">
              On-time vs Late delta
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Tương quan Delivery × CSAT
            </div>
            <div className="kpi-numeric mt-2 text-[40px] font-semibold leading-none tracking-tight text-[var(--danger)]">
              {csat.correlation.toFixed(2)}
            </div>
            <div className="mt-2 text-xs text-[var(--muted-strong)]">
              Pearson r — moderate negative
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader
              title="Distribution Split"
              subtitle="% review score — late vs on-time"
            />
            <CardBody>
              <ReviewDistribution compare={csat.compare} />
              <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
                Đơn trễ hẹn nhận{" "}
                <span className="font-mono font-semibold text-[var(--danger)]">
                  {((late.distribution["1"] / late.numOrders) * 100).toFixed(0)}%
                </span>{" "}
                review 1★. Đơn đúng hẹn nhận{" "}
                <span className="font-mono font-semibold text-[var(--success)]">
                  {((ontime.distribution["5"] / ontime.numOrders) * 100).toFixed(0)}%
                </span>{" "}
                review 5★ — chênh lệch đảo cực rõ rệt.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="CSAT theo nhóm thời gian giao"
              subtitle="Điểm trung bình suy giảm tuyến tính"
            />
            <CardBody>
              <DeliveryBucketChart data={csat.deliveryBuckets} />
              <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
                Đường CSAT (cam) suy giảm nhanh sau ngưỡng 15 ngày — đây là{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  break-even point
                </span>{" "}
                cần đặt SLA.
              </p>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Category Risk Matrix"
            subtitle="Top 8 ngành hàng nhạy cảm với late delivery"
          />
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium">Items</th>
                    <th className="px-3 py-2 font-medium">Late rate</th>
                    <th className="px-3 py-2 font-medium">Avg delivery</th>
                    <th className="px-3 py-2 font-medium">Avg freight ratio</th>
                    <th className="px-3 py-2 font-medium">Avg price (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {sensitiveCategories.map((c) => (
                    <tr
                      key={c.category}
                      className="border-t border-[var(--border)] hover:bg-[var(--card-elevated)]"
                    >
                      <td className="px-3 py-2.5 capitalize text-[var(--foreground)]">
                        {c.category.replace(/_/g, " ")}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-[var(--muted-strong)]">
                        {formatNumber(c.items)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="kpi-numeric text-xs font-semibold"
                          style={{ color: lateRateColor(c.lateRate) }}
                        >
                          {c.lateRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-[var(--muted-strong)]">
                        {c.avgDelivery.toFixed(1)}d
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-[var(--muted-strong)]">
                        {(c.avgFreightRatio * 100).toFixed(1)}%
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-[var(--muted-strong)]">
                        {c.avgPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function CompareCard({
  label,
  avg,
  count,
  lowRate,
  color,
}: {
  label: string;
  avg: number;
  count: number;
  lowRate: number;
  color: string;
}) {
  return (
    <div
      className="rounded-xl border bg-[var(--card)] p-5"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: color }}
        />
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {label}
        </div>
      </div>
      <div
        className="kpi-numeric mt-2 text-[40px] font-semibold leading-none tracking-tight"
        style={{ color }}
      >
        {avg.toFixed(2)}
        <span className="ml-1 text-base text-[var(--muted)]">★</span>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-[var(--muted-strong)]">
        <span className="font-mono">{formatNumber(count)} đơn</span>
        <span className="font-mono">·</span>
        <span className="font-mono">{lowRate.toFixed(1)}% ≤ 2★</span>
      </div>
    </div>
  );
}
