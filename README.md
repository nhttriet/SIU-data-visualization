# OLIST — Logistics Intelligence Dashboard

Đồ án môn **Data Visualization** — phân tích dữ liệu logistics thương mại điện tử của [Olist Brazil](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce) (96,478 đơn hàng, 27 bang, 09/2016 – 08/2018).

Dashboard kể câu chuyện kinh doanh xoay quanh **mối quan hệ giữa hiệu suất logistics và sự hài lòng khách hàng (CSAT)** — không chỉ vẽ biểu đồ rời rạc.

---

## Demo

| Trang | Nội dung |
|---|---|
| `/` — **Tổng Quan** | 4 KPI core, line chart volume + late rate, top regions, Impact Analysis (correlation Delivery × CSAT) |
| `/routes/` — **Logistics Tuyến** | Heatmap origin × destination 15×15 bang, top 15 routes by GMV, scatter freight vs delivery |
| `/csat/` — **Đánh Giá CSAT** | Distribution split (late vs on-time), CSAT theo bucket số ngày giao, Category Risk Matrix |
| `/audit/` — **Báo Cáo Kiểm Toán** | Choropleth Brazil (27 bang), anomaly timeline, bảng top 50 đơn vi phạm SLA (sortable + filterable) |

---

## Kiến trúc

```
CSV (6 files, ~75 MB)
    ↓ Python + pandas
JSON aggregate (~44 KB)
    ↓ Next.js static export
HTML/CSS/JS tĩnh
    ↓ nginx
Browser
```

Tách biệt rõ ràng:
- **Python** chỉ xử lý dữ liệu (ETL)
- **TypeScript/React** chỉ làm UI (frontend)
- **Static export** → deploy bất kỳ host tĩnh nào, không cần backend runtime

---

## Stack

| Layer | Tech |
|---|---|
| ETL | Python 3.12, pandas, numpy |
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 (theme dark strategic, custom tokens) |
| Charts | Recharts, custom SVG choropleth (d3-geo + GeoJSON Brazil) |
| Fonts | Inter (body) + JetBrains Mono (KPI numerics) |
| Icons | Lucide |
| Container | Multi-stage Dockerfile → nginx alpine (~64 MB image) |
| Data sync | gdown (Google Drive) |

---

## Cấu trúc thư mục

```
.
├── data/                       # CSV gốc (gitignored — fetch từ Drive)
│   ├── processed/              # 4 dataset đã clean
│   └── reports/                # 2 audit report
├── etl/
│   ├── build_data.py           # CSV → 8 file JSON aggregate
│   └── requirements.txt
├── web/                        # Next.js app
│   ├── app/                    # 4 routes static
│   │   ├── page.tsx            # Tổng Quan
│   │   ├── routes/page.tsx     # Logistics Tuyến
│   │   ├── csat/page.tsx       # Đánh Giá CSAT
│   │   └── audit/page.tsx      # Báo Cáo Kiểm Toán
│   ├── components/
│   │   ├── charts/             # 11 chart components
│   │   ├── Card.tsx
│   │   ├── KpiCard.tsx
│   │   ├── PageHeader.tsx
│   │   └── Sidebar.tsx
│   ├── lib/                    # types, colors, data loader, utils
│   ├── public/
│   │   ├── data/               # JSON output từ ETL (committed)
│   │   └── geo/brazil-states.json
│   └── nginx.conf
├── download_drive_data.py      # Sync 6 CSV từ Google Drive
├── Dockerfile                  # 5-stage: data-sync → etl → deps → build → nginx
├── .dockerignore
└── .gitignore
```

---

## Chạy local

### 1. Lấy dữ liệu

```bash
pip install gdown
python download_drive_data.py
```

Sẽ tạo `data/processed/` và `data/reports/` với 6 file CSV.

### 2. ETL → JSON

```bash
cd etl
pip install -r requirements.txt
python build_data.py
```

Output: `web/public/data/*.json` (8 file, tổng ~44 KB).

### 3. Frontend

```bash
cd web
npm install
npm run dev          # http://localhost:3000
```

Build static cho deploy:

```bash
npm run build        # output → web/out/
npx serve web/out    # preview
```

---

## Chạy Docker

```bash
docker build -t olist-dashboard .
docker run -d -p 8080:8080 --name olist olist-dashboard
# → http://localhost:8080
```

Multi-stage build:

| Stage | Mục đích | Cache |
|---|---|---|
| `data-sync` | gdown → 6 CSV từ Google Drive | invalidate khi `download_drive_data.py` đổi |
| `etl` | pandas → 8 JSON aggregate | invalidate khi `etl/` đổi |
| `deps` | `npm ci` | invalidate khi `package*.json` đổi |
| `web-build` | `next build` → static export | invalidate khi `web/` đổi |
| `runtime` | nginx alpine + static files | image cuối ~64 MB |

---

## Deploy

### Vercel (khuyến nghị, free)

1. Push repo lên GitHub
2. Import vào Vercel, chọn root = `web/`
3. Build command: `npm run build` · Output dir: `out`
4. Auto-deploy mỗi commit

### DigitalOcean App Platform

1. Build từ Dockerfile (App Platform tự detect)
2. Settings → Component → HTTP Port: **8080** (cả Public lẫn Internal)
3. Push → auto-deploy

### Bất kỳ host tĩnh nào

Upload toàn bộ thư mục `web/out/` (sau `npm run build`) lên Netlify / Cloudflare Pages / S3+CloudFront.

---

## Triết lý thiết kế

| Nguyên tắc | Cụ thể trong dashboard |
|---|---|
| **Insight-First** | Mỗi trang trả lời 1 câu hỏi kinh doanh, không phải "đây là biểu đồ X" |
| **Information Hierarchy** | KPI: JetBrains Mono 44px · Body: Inter · 4 cấp font-size rõ rệt |
| **Atomic Visualization** | Mọi chart hover được; mọi KPI có delta + benchmark |
| **Dark Strategic Theme** | Background `#0A0E1A`, primary `#3B82F6`, danger `#EF4444`, success `#10B981` |
| **Story Arc** | Trang 1 mở vấn đề → Trang 4 chỉ ra ở đâu → Trang 2 xác định tuyến nào → Trang 3 lượng hóa tác động |

---

## Số liệu nổi bật từ data thật

- Tổng đơn đã giao: **96,478**
- Late rate trung bình: **8.11%**
- Thời gian giao TB: **12.56 ngày**
- Điểm CSAT TB: **4.16 ★**
- Correlation Delivery × CSAT: **−0.33** (moderate negative)
- Late orders nhận **54%** review ≤ 2★ vs **9%** ở on-time orders
- Đỉnh trễ: T11/2017 (Black Friday)

---

## Tham khảo

- Dataset gốc: [Olist Brazilian E-Commerce Public Dataset](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce)
- GeoJSON 27 bang Brazil: [click_that_hood/brazil-states.geojson](https://github.com/codeforgermany/click_that_hood/blob/main/public/data/brazil-states.geojson)

---

## License

Mã nguồn cho mục đích học tập (môn Data Visualization). Dataset Olist phát hành dưới [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
