import type { ReactNode } from "react";

export function PageHeader({
  version = "2.5.0",
  badge = "LIVE SNAPSHOT",
  title,
  subtitle,
  rightSlot,
}: {
  version?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-[var(--border)] px-10 py-8">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded border border-[var(--border-strong)] bg-[var(--card)] px-2 py-0.5 font-mono text-[10px] tracking-wider text-[var(--muted)]">
            D_VER: {version}
          </span>
          <span className="rounded bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[var(--primary)]">
            {badge}
          </span>
        </div>
        <h1 className="text-[34px] font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
        )}
      </div>
      {rightSlot}
    </div>
  );
}
