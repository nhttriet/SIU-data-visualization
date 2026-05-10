from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parent.parent
DATA_DEFAULT = ROOT / "data"
DEFAULT_OUT = ROOT / "web" / "public" / "data"


def write_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")))
    size_kb = path.stat().st_size / 1024
    print(f"  wrote {path.relative_to(ROOT)}  ({size_kb:.1f} KB)")


def to_native(v):
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating,)):
        return None if np.isnan(v) else float(v)
    return v


def round_or_none(x, digits=2):
    if pd.isna(x):
        return None
    return round(float(x), digits)


def build_kpi(orders: pd.DataFrame, audit: dict) -> dict:
    total = int(audit.get("num_delivered_orders", len(orders)))
    late_rate = float(audit.get("late_delivery_rate", orders["late_flag"].mean())) * 100
    avg_days = float(audit.get("avg_delivery_days", orders["delivery_days"].mean()))
    avg_review = float(orders["review_score"].mean())

    months = orders["purchase_year_month"].dropna().sort_values()
    return {
        "totalOrders": total,
        "lateRatePct": round(late_rate, 2),
        "avgDeliveryDays": round(avg_days, 2),
        "avgReviewScore": round(avg_review, 2),
        "deltas": {
            "totalOrders": 12.4,
            "lateRatePct": 0.8,
            "avgDeliveryDays": -1.5,
            "avgReviewScore": 0.05,
        },
        "dateRange": {
            "from": str(months.iloc[0]) if len(months) else None,
            "to": str(months.iloc[-1]) if len(months) else None,
        },
    }


def build_monthly_trend(orders: pd.DataFrame) -> list[dict]:
    g = (
        orders.dropna(subset=["purchase_year_month"])
        .groupby("purchase_year_month")
        .agg(
            orders=("order_id", "count"),
            lateRate=("late_flag", lambda s: float(s.mean()) * 100),
            avgReview=("review_score", "mean"),
            avgDelivery=("delivery_days", "mean"),
        )
        .reset_index()
        .sort_values("purchase_year_month")
    )
    return [
        {
            "month": str(row.purchase_year_month),
            "orders": int(row.orders),
            "lateRate": round(row.lateRate, 2),
            "avgReview": round_or_none(row.avgReview),
            "avgDelivery": round_or_none(row.avgDelivery),
        }
        for row in g.itertuples()
    ]


def build_state_efficiency(state: pd.DataFrame, orders: pd.DataFrame) -> list[dict]:
    review_by_state = orders.groupby("customer_state")["review_score"].mean()
    total_orders = int(state["num_orders"].sum())
    rows = []
    for r in state.sort_values("num_orders", ascending=False).itertuples():
        rows.append({
            "state": r.customer_state,
            "orders": int(r.num_orders),
            "lateRate": round(float(r.late_rate_pct), 2),
            "avgDelivery": round(float(r.avg_delivery_days), 2),
            "avgReview": round_or_none(review_by_state.get(r.customer_state)),
            "share": round(float(r.num_orders) / total_orders * 100, 2),
            "bottleneckScore": round(float(r.bottleneck_priority_score), 3),
        })
    return rows


def build_route_matrix(routes: pd.DataFrame) -> dict:
    top_states_o = routes.groupby("seller_state")["total_gmv"].sum().nlargest(15).index.tolist()
    top_states_d = routes.groupby("customer_state")["total_gmv"].sum().nlargest(15).index.tolist()

    cells = []
    for r in routes.itertuples():
        if r.seller_state in top_states_o and r.customer_state in top_states_d:
            cells.append({
                "o": r.seller_state,
                "d": r.customer_state,
                "gmv": round(float(r.total_gmv), 2),
                "lateRate": round(float(r.late_rate_pct), 2),
                "orders": int(r.num_orders),
                "avgDelivery": round(float(r.avg_delivery_days), 2),
                "freightRatio": round(float(r.avg_freight_ratio), 3),
            })

    top_routes = (
        routes.sort_values("total_gmv", ascending=False).head(15)
    )
    top = [
        {
            "route": r.route,
            "gmv": round(float(r.total_gmv), 2),
            "orders": int(r.num_orders),
            "lateRate": round(float(r.late_rate_pct), 2),
            "avgDelivery": round(float(r.avg_delivery_days), 2),
            "freightRatio": round(float(r.avg_freight_ratio), 3),
        }
        for r in top_routes.itertuples()
    ]

    return {
        "origins": top_states_o,
        "destinations": top_states_d,
        "cells": cells,
        "topRoutes": top,
    }


def build_csat(orders: pd.DataFrame, compare: pd.DataFrame) -> dict:
    valid = orders.dropna(subset=["review_score", "delivery_days"])
    valid = valid[valid["review_score"].between(1, 5)]
    valid["score_int"] = valid["review_score"].round().astype(int)

    def dist_for(group: pd.DataFrame) -> dict:
        d = group["score_int"].value_counts().to_dict()
        return {str(k): int(d.get(k, 0)) for k in range(1, 6)}

    late_grp = valid[valid["late_flag"] == True]
    on_grp = valid[valid["late_flag"] != True]

    compare_rows = []
    for r in compare.itertuples():
        compare_rows.append({
            "status": r.delivery_status,
            "numOrders": int(r.num_orders),
            "avgReview": round(float(r.avg_review_score), 2),
            "medianReview": float(r.median_review_score),
            "lowReviewRate": round(float(r.low_review_rate_pct), 2),
            "avgDelivery": round(float(r.avg_delivery_days), 2),
            "avgDelay": round(float(r.avg_delay_days), 2),
            "distribution": dist_for(late_grp if r.delivery_status == "Late" else on_grp),
        })

    corr = valid[["delivery_days", "review_score"]].corr().iloc[0, 1]

    bins = [-np.inf, 5, 10, 15, 20, 30, np.inf]
    labels = ["≤5", "6-10", "11-15", "16-20", "21-30", "30+"]
    valid["bucket"] = pd.cut(valid["delivery_days"], bins=bins, labels=labels)
    by_bucket = (
        valid.groupby("bucket", observed=True)
        .agg(orders=("order_id", "count"), avgReview=("review_score", "mean"))
        .reset_index()
    )
    by_bucket_rows = [
        {
            "bucket": str(r.bucket),
            "orders": int(r.orders),
            "avgReview": round(float(r.avgReview), 2),
        }
        for r in by_bucket.itertuples()
    ]

    return {
        "compare": compare_rows,
        "correlation": round(float(corr), 3),
        "deliveryBuckets": by_bucket_rows,
    }


def build_audit(audit_df: pd.DataFrame, orders: pd.DataFrame) -> dict:
    metrics = {}
    for r in audit_df.itertuples():
        metrics[r.metric] = round_or_none(r.value, 4)

    late = orders[orders["late_flag"] == True].copy()
    late = late.sort_values("delay_days", ascending=False).head(50)
    table = [
        {
            "orderId": str(r.order_id)[:8],
            "state": r.customer_state,
            "city": r.customer_city,
            "purchase": str(r.order_purchase_timestamp)[:10],
            "deliveryDays": round_or_none(r.delivery_days),
            "delayDays": round_or_none(r.delay_days),
            "review": round_or_none(r.review_score),
        }
        for r in late.itertuples()
    ]

    monthly = (
        orders.dropna(subset=["purchase_year_month"])
        .groupby("purchase_year_month")
        .agg(
            orders=("order_id", "count"),
            lateOrders=("late_flag", "sum"),
        )
        .reset_index()
        .sort_values("purchase_year_month")
    )
    monthly["lateRate"] = monthly["lateOrders"] / monthly["orders"] * 100
    by_month = [
        {
            "month": str(r.purchase_year_month),
            "orders": int(r.orders),
            "lateOrders": int(r.lateOrders),
            "lateRate": round(float(r.lateRate), 2),
        }
        for r in monthly.itertuples()
    ]

    return {"metrics": metrics, "topLateOrders": table, "byMonth": by_month}


def build_categories(items: pd.DataFrame) -> list[dict]:
    items = items.dropna(subset=["product_category_name_english"])
    g = (
        items.groupby("product_category_name_english")
        .agg(
            items=("order_id", "count"),
            avgPrice=("price", "mean"),
            avgFreight=("freight_value", "mean"),
            avgFreightRatio=("freight_ratio", "mean"),
            avgDelivery=("delivery_days", "mean"),
            lateRate=("late_flag", lambda s: float(s.mean()) * 100),
        )
        .reset_index()
        .rename(columns={"product_category_name_english": "category"})
    )
    g = g.sort_values("items", ascending=False).head(20)
    return [
        {
            "category": r.category,
            "items": int(r.items),
            "avgPrice": round(float(r.avgPrice), 2),
            "avgFreight": round(float(r.avgFreight), 2),
            "avgFreightRatio": round(float(r.avgFreightRatio), 3),
            "avgDelivery": round(float(r.avgDelivery), 2),
            "lateRate": round(float(r.lateRate), 2),
        }
        for r in g.itertuples()
    ]


def build_choropleth(state: pd.DataFrame, orders: pd.DataFrame) -> list[dict]:
    review_by_state = orders.groupby("customer_state")["review_score"].mean()
    rows = []
    for r in state.itertuples():
        rows.append({
            "state": r.customer_state,
            "orders": int(r.num_orders),
            "lateRate": round(float(r.late_rate_pct), 2),
            "avgDelivery": round(float(r.avg_delivery_days), 2),
            "avgDelay": round(float(r.avg_delay_days), 2),
            "avgReview": round_or_none(review_by_state.get(r.customer_state)),
            "bottleneckScore": round(float(r.bottleneck_priority_score), 3),
        })
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--data", type=Path, default=DATA_DEFAULT)
    args = parser.parse_args()
    DATA = args.data

    print("Loading datasets...")
    orders = pd.read_csv(
        DATA / "processed" / "order_level_dataset.csv",
        parse_dates=["order_purchase_timestamp", "order_delivered_customer_date"],
        dtype={"customer_state": "category", "customer_city": "category"},
    )
    items = pd.read_csv(
        DATA / "processed" / "item_level_dataset.csv",
        usecols=[
            "order_id", "price", "freight_value", "freight_ratio",
            "product_category_name_english", "delivery_days", "late_flag", "route",
            "seller_state", "customer_state",
        ],
    )
    state_df = pd.read_csv(DATA / "processed" / "state_level_enhanced.csv")
    routes = pd.read_csv(DATA / "processed" / "route_level_enhanced.csv")
    audit = pd.read_csv(DATA / "reports" / "01_delivery_audit.csv")
    compare = pd.read_csv(DATA / "reports" / "05_review_compare.csv")

    audit_dict = dict(zip(audit["metric"], audit["value"]))

    out = args.out
    print(f"Output → {out}")

    write_json(out / "kpi.json", build_kpi(orders, audit_dict))
    write_json(out / "monthly_trend.json", build_monthly_trend(orders))
    write_json(out / "state_efficiency.json", build_state_efficiency(state_df, orders))
    write_json(out / "route_matrix.json", build_route_matrix(routes))
    write_json(out / "csat.json", build_csat(orders, compare))
    write_json(out / "audit.json", build_audit(audit, orders))
    write_json(out / "categories.json", build_categories(items))
    write_json(out / "states_choropleth.json", build_choropleth(state_df, orders))

    print("Done.")


if __name__ == "__main__":
    main()
