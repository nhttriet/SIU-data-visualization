import { readFileSync } from "fs";
import { join } from "path";
import type {
  Kpi,
  MonthlyPoint,
  StateRow,
  RouteMatrix,
  CsatData,
  AuditData,
  CategoryRow,
  ChoroplethRow,
} from "./types";

function load<T>(name: string): T {
  const p = join(process.cwd(), "public", "data", name);
  return JSON.parse(readFileSync(p, "utf-8")) as T;
}

export const getKpi = () => load<Kpi>("kpi.json");
export const getMonthlyTrend = () => load<MonthlyPoint[]>("monthly_trend.json");
export const getStateEfficiency = () => load<StateRow[]>("state_efficiency.json");
export const getRouteMatrix = () => load<RouteMatrix>("route_matrix.json");
export const getCsat = () => load<CsatData>("csat.json");
export const getAudit = () => load<AuditData>("audit.json");
export const getCategories = () => load<CategoryRow[]>("categories.json");
export const getChoropleth = () => load<ChoroplethRow[]>("states_choropleth.json");
