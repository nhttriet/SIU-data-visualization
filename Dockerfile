# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Sync raw CSV from Google Drive (cached layer)
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.12-slim AS data-sync

WORKDIR /sync

RUN pip install --no-cache-dir gdown==5.2.0

COPY download_drive_data.py ./
RUN python download_drive_data.py

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Run ETL: CSV → aggregated JSON
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.12-slim AS etl

WORKDIR /etl

COPY etl/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY etl/build_data.py ./
COPY --from=data-sync /sync/data /data

RUN python build_data.py --data /data --out /out/data

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — Install Node deps (cached separately from source)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS deps

WORKDIR /app

COPY web/package.json web/package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ─────────────────────────────────────────────────────────────────────────────
# Stage 4 — Build static Next.js export
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS web-build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY web/ ./
COPY --from=etl /out/data ./public/data

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 5 — Serve static export via nginx
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf

COPY web/nginx.conf /etc/nginx/conf.d/dashboard.conf
COPY --from=web-build /app/out /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -q --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
