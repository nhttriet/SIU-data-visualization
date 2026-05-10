export interface Kpi {
  totalOrders: number;
  lateRatePct: number;
  avgDeliveryDays: number;
  avgReviewScore: number;
  deltas: {
    totalOrders: number;
    lateRatePct: number;
    avgDeliveryDays: number;
    avgReviewScore: number;
  };
  dateRange: { from: string | null; to: string | null };
}

export interface MonthlyPoint {
  month: string;
  orders: number;
  lateRate: number;
  avgReview: number | null;
  avgDelivery: number | null;
}

export interface StateRow {
  state: string;
  orders: number;
  lateRate: number;
  avgDelivery: number;
  avgReview: number | null;
  share: number;
  bottleneckScore: number;
}

export interface RouteCell {
  o: string;
  d: string;
  gmv: number;
  lateRate: number;
  orders: number;
  avgDelivery: number;
  freightRatio: number;
}

export interface RouteRow {
  route: string;
  gmv: number;
  orders: number;
  lateRate: number;
  avgDelivery: number;
  freightRatio: number;
}

export interface RouteMatrix {
  origins: string[];
  destinations: string[];
  cells: RouteCell[];
  topRoutes: RouteRow[];
}

export interface CsatCompare {
  status: string;
  numOrders: number;
  avgReview: number;
  medianReview: number;
  lowReviewRate: number;
  avgDelivery: number;
  avgDelay: number;
  distribution: Record<string, number>;
}

export interface CsatData {
  compare: CsatCompare[];
  correlation: number;
  deliveryBuckets: { bucket: string; orders: number; avgReview: number }[];
}

export interface AuditOrder {
  orderId: string;
  state: string;
  city: string;
  purchase: string;
  deliveryDays: number | null;
  delayDays: number | null;
  review: number | null;
}

export interface AuditData {
  metrics: Record<string, number | null>;
  topLateOrders: AuditOrder[];
  byMonth: { month: string; orders: number; lateOrders: number; lateRate: number }[];
}

export interface CategoryRow {
  category: string;
  items: number;
  avgPrice: number;
  avgFreight: number;
  avgFreightRatio: number;
  avgDelivery: number;
  lateRate: number;
}

export interface ChoroplethRow {
  state: string;
  orders: number;
  lateRate: number;
  avgDelivery: number;
  avgDelay: number;
  avgReview: number | null;
  bottleneckScore: number;
}
