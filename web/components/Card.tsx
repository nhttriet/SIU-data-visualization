import { cn } from "@/lib/utils";
import type { ReactNode, HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[0_1px_0_rgba(255,255,255,0.02)_inset]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between p-5 pb-3", className)}>
      <div>
        <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5", className)} {...props} />;
}
