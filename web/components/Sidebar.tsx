"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, Route, Star, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Tổng Quan", icon: BarChart3 },
  { href: "/routes", label: "Logistics Tuyến", icon: Route },
  { href: "/csat", label: "Đánh Giá CSAT", icon: Star },
  { href: "/audit", label: "Báo Cáo Kiểm Toán", icon: FileSearch },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
          <Activity className="h-5 w-5" strokeWidth={2.4} />
        </div>
        <div>
          <div className="text-[15px] font-semibold tracking-tight">OLIST</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
            Logistics Unit
          </div>
        </div>
      </div>

      <div className="px-4 pb-2 pt-4 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
        Phân tích hệ thống
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map((item) => {
          const target = item.href === "/" ? "/" : item.href + "/";
          const isActive =
            pathname === target ||
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-[var(--muted-strong)] hover:bg-[var(--card)] hover:text-[var(--foreground)]",
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
          Trạng thái dữ liệu
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
          </span>
          <span className="text-[var(--muted-strong)]">Đã đồng bộ Drive</span>
        </div>
      </div>
    </aside>
  );
}
