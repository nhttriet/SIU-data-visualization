export const COLORS = {
  primary: "#3b82f6",
  primarySoft: "rgba(59, 130, 246, 0.16)",
  success: "#10b981",
  successSoft: "rgba(16, 185, 129, 0.16)",
  danger: "#ef4444",
  dangerSoft: "rgba(239, 68, 68, 0.16)",
  warning: "#f59e0b",
  accent: "#8b5cf6",
  muted: "#8a96b0",
  border: "#1f2a44",
  borderStrong: "#2a3654",
  card: "#131a2c",
  background: "#0a0e1a",
} as const;

export const CHART_PALETTE = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

export function lateRateColor(pct: number) {
  if (pct < 6) return COLORS.success;
  if (pct < 12) return COLORS.warning;
  if (pct < 20) return "#f97316";
  return COLORS.danger;
}
