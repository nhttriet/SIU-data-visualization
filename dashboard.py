import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path
import subprocess
import sys

# ============================================================
# INITIALIZE DATA
# ============================================================
def ensure_data_exists():
    """Download data from Google Drive if it doesn't exist."""
    data_file = Path(__file__).parent / "data" / "processed" / "order_level_dataset.csv"
    
    if not data_file.exists():
        st.warning("📥 Downloading required data from Google Drive... (this may take a few minutes)")
        try:
            result = subprocess.run(
                [sys.executable, "download_drive_data.py"],
                cwd=Path(__file__).parent,
                capture_output=True,
                text=True,
                timeout=300
            )
            if result.returncode == 0:
                st.success("✅ Data downloaded successfully!")
            else:
                st.error(f"❌ Failed to download data: {result.stderr}")
                st.stop()
        except Exception as e:
            st.error(f"❌ Error downloading data: {str(e)}")
            st.stop()

ensure_data_exists()

# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(
    page_title="OLIST Logistics Intelligence",
    page_icon="◆",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={"Get help": None, "Report a bug": None, "About": None},
)

# ============================================================
# MODERN DARK UI — glassmorphism + neon accents
# ============================================================
st.markdown(
    """
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">

<style>
    /* ===== Hide Streamlit chrome ===== */
    #MainMenu, .stDeployButton, [data-testid="stToolbar"], footer {display: none !important;}
    header[data-testid="stHeader"] {background: transparent; height: 0;}

    /* ===== Global background — deep space gradient with mesh ===== */
    .stApp {
        background:
            radial-gradient(circle at 15% 20%, rgba(139, 92, 246, 0.18) 0%, transparent 40%),
            radial-gradient(circle at 85% 80%, rgba(34, 211, 238, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.08) 0%, transparent 50%),
            linear-gradient(180deg, #050816 0%, #0a0e1a 50%, #0d1224 100%);
        background-attachment: fixed;
    }

    /* Subtle grain texture overlay */
    .stApp::before {
        content: "";
        position: fixed;
        inset: 0;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.04 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        pointer-events: none;
        opacity: 0.6;
        z-index: 0;
    }

    /* ===== Block container — full width transparent ===== */
    .main .block-container,
    [data-testid="stMain"] .block-container,
    [data-testid="stMainBlockContainer"] {
        background: transparent !important;
        padding: 1.5rem 2rem 3rem 2rem !important;
        max-width: 1500px !important;
    }

    /* ===== Typography ===== */
    html, body, [class*="css"], .stMarkdown, p, span, div {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
        color: #e2e8f0;
    }

    h1 {
        font-family: 'Inter', sans-serif !important;
        color: #f8fafc !important;
        font-size: 2.1rem !important;
        font-weight: 800 !important;
        letter-spacing: -0.02em !important;
        margin: 0 0 0.3rem 0 !important;
        background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #67e8f9 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    h2 {
        color: #f1f5f9 !important;
        font-size: 1.25rem !important;
        font-weight: 700 !important;
        letter-spacing: -0.01em !important;
        margin: 2rem 0 1rem 0 !important;
        padding-left: 12px !important;
        border-left: 3px solid #a78bfa !important;
        border-bottom: none !important;
    }

    h3, h4 {
        color: #cbd5e1 !important;
        font-size: 0.95rem !important;
        font-weight: 600 !important;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 1.2rem 0 0.6rem 0 !important;
    }

    p, .stMarkdown p { color: #94a3b8; line-height: 1.6; }

    /* ===== Sidebar ===== */
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #050816 0%, #0a0e1a 100%) !important;
        border-right: 1px solid rgba(139, 92, 246, 0.15);
    }
    section[data-testid="stSidebar"] > div {
        background: transparent !important;
        padding-top: 1rem;
    }
    section[data-testid="stSidebar"] * {
        color: #cbd5e1 !important;
        font-family: 'Inter', sans-serif !important;
    }
    section[data-testid="stSidebar"] h1 {
        color: #f8fafc !important;
        font-size: 1.3rem !important;
        background: linear-gradient(135deg, #ffffff 0%, #a78bfa 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    section[data-testid="stSidebar"] h3 {
        color: #94a3b8 !important;
        font-size: 0.75rem !important;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: 700 !important;
    }
    section[data-testid="stSidebar"] label {
        color: #cbd5e1 !important;
        font-weight: 500 !important;
        font-size: 0.85rem !important;
    }
    section[data-testid="stSidebar"] .stRadio label,
    section[data-testid="stSidebar"] .stRadio div[role="radiogroup"] label {
        padding: 0.5rem 0.7rem;
        border-radius: 8px;
        transition: all 0.2s ease;
    }
    section[data-testid="stSidebar"] .stRadio label:hover {
        background: rgba(139, 92, 246, 0.1);
    }
    section[data-testid="stSidebar"] .stCaption {
        color: #64748b !important;
        font-size: 0.75rem !important;
    }

    /* ===== Custom KPI cards ===== */
    .kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin: 0.5rem 0 1.5rem 0;
    }
    @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }

    .kpi-card {
        position: relative;
        background: linear-gradient(135deg, rgba(20, 27, 45, 0.85) 0%, rgba(13, 18, 36, 0.85) 100%);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(148, 163, 184, 0.1);
        border-radius: 16px;
        padding: 1.3rem 1.4rem;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .kpi-card::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 16px;
        padding: 1px;
        background: linear-gradient(135deg, var(--accent, #a78bfa) 0%, transparent 60%);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
    }
    .kpi-card::after {
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: linear-gradient(90deg, transparent, var(--accent, #a78bfa), transparent);
        opacity: 0.8;
    }
    .kpi-card:hover {
        transform: translateY(-4px);
        border-color: rgba(148, 163, 184, 0.25);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px var(--glow, rgba(167, 139, 250, 0.15));
    }
    .kpi-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: var(--accent-bg, rgba(167, 139, 250, 0.15));
        color: var(--accent, #a78bfa);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        margin-bottom: 0.8rem;
    }
    .kpi-label {
        color: #94a3b8;
        font-size: 0.78rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 0.3rem;
    }
    .kpi-value {
        color: #f8fafc;
        font-size: 2rem;
        font-weight: 800;
        font-family: 'Inter', sans-serif;
        font-variant-numeric: tabular-nums;
        line-height: 1.1;
        letter-spacing: -0.02em;
    }
    .kpi-unit { color: #64748b; font-size: 0.85rem; font-weight: 500; margin-left: 4px; }
    .kpi-delta {
        margin-top: 0.6rem;
        font-size: 0.78rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .kpi-delta.up-good   { color: #10b981; }
    .kpi-delta.up-bad    { color: #f43f5e; }
    .kpi-delta.down-good { color: #10b981; }
    .kpi-delta.down-bad  { color: #f43f5e; }
    .kpi-delta.neutral   { color: #64748b; }
    .kpi-target {
        margin-top: 0.4rem;
        font-size: 0.72rem;
        color: #64748b;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    .kpi-target.met { color: #10b981; }
    .kpi-target.miss { color: #f59e0b; }

    /* ===== Filter chips ===== */
    .filter-bar { display: flex; flex-wrap: wrap; gap: 8px; margin: 0.5rem 0 1.2rem 0; }
    .filter-chip {
        background: rgba(139, 92, 246, 0.12);
        color: #c4b5fd;
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 600;
        border: 1px solid rgba(139, 92, 246, 0.25);
        backdrop-filter: blur(10px);
    }

    /* ===== Glass panels for charts/tables ===== */
    [data-testid="stDataFrame"], [data-testid="stTable"] {
        background: rgba(20, 27, 45, 0.6) !important;
        border: 1px solid rgba(148, 163, 184, 0.1) !important;
        border-radius: 12px !important;
        backdrop-filter: blur(10px);
        overflow: hidden;
    }
    [data-testid="stDataFrame"] table { color: #e2e8f0 !important; }
    [data-testid="stDataFrame"] thead {
        background: rgba(139, 92, 246, 0.1) !important;
    }
    [data-testid="stDataFrame"] thead th {
        color: #c4b5fd !important;
        font-weight: 600 !important;
        text-transform: uppercase;
        font-size: 0.75rem !important;
        letter-spacing: 0.05em;
    }

    /* Wrap iframe charts in glass card */
    iframe { border-radius: 12px; background: rgba(255,255,255,0.97); }
    .element-container:has(iframe) {
        background: rgba(20, 27, 45, 0.5);
        border: 1px solid rgba(148, 163, 184, 0.1);
        border-radius: 14px;
        padding: 8px;
        backdrop-filter: blur(10px);
    }

    /* ===== Info / Warning panels ===== */
    [data-testid="stAlert"], .stInfo, .stWarning, .stSuccess, .stError {
        background: rgba(20, 27, 45, 0.7) !important;
        border: 1px solid rgba(148, 163, 184, 0.15) !important;
        border-radius: 12px !important;
        backdrop-filter: blur(10px);
    }
    .stInfo { border-left: 3px solid #a78bfa !important; }
    .stWarning { border-left: 3px solid #f59e0b !important; }
    .stSuccess { border-left: 3px solid #10b981 !important; }
    .stInfo *, .stWarning *, .stSuccess *, .stError * { color: #e2e8f0 !important; }

    /* ===== Inputs ===== */
    .stSelectbox > div > div, .stMultiSelect > div > div, .stDateInput > div > div, .stNumberInput > div > div {
        background: rgba(20, 27, 45, 0.7) !important;
        border: 1px solid rgba(148, 163, 184, 0.15) !important;
        border-radius: 10px !important;
        color: #e2e8f0 !important;
    }
    .stSelectbox > div > div:hover, .stMultiSelect > div > div:hover {
        border-color: rgba(139, 92, 246, 0.4) !important;
    }

    /* ===== Buttons ===== */
    .stButton > button {
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 10px !important;
        padding: 0.6rem 1.4rem !important;
        font-weight: 600 !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
    }
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.5);
    }

    /* ===== Divider ===== */
    hr {
        border: none !important;
        height: 1px !important;
        background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.2), transparent) !important;
        margin: 1.5rem 0 !important;
    }

    /* ===== Title block ===== */
    .title-block {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 0.4rem;
    }
    .title-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(139, 92, 246, 0.12);
        border: 1px solid rgba(139, 92, 246, 0.3);
        color: #c4b5fd;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }
    .live-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
        animation: pulse 2s infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
    }

    .subtitle {
        color: #94a3b8 !important;
        font-size: 0.95rem !important;
        font-weight: 400 !important;
        margin: 0 0 1rem 0 !important;
    }

    /* Insight panel */
    .insight-card {
        background: linear-gradient(135deg, rgba(20, 27, 45, 0.8) 0%, rgba(13, 18, 36, 0.8) 100%);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(148, 163, 184, 0.12);
        border-radius: 14px;
        padding: 1.2rem 1.3rem;
        margin-bottom: 1rem;
    }
    .insight-card h4 {
        color: #f1f5f9 !important;
        font-size: 0.95rem !important;
        margin: 0 0 0.8rem 0 !important;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .insight-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(148, 163, 184, 0.08);
        font-size: 0.88rem;
    }
    .insight-row:last-child { border-bottom: none; }
    .insight-label { color: #94a3b8; }
    .insight-value { color: #f1f5f9; font-weight: 600; font-variant-numeric: tabular-nums; }
    .badge-ok   { background: rgba(16,185,129,0.15); color: #34d399; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
    .badge-warn { background: rgba(245,158,11,0.15); color: #fbbf24; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
    .badge-bad  { background: rgba(244,63,94,0.15);  color: #fb7185; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
</style>
""",
    unsafe_allow_html=True,
)

# ============================================================
# CONSTANTS
# ============================================================
BASE_DIR = Path(__file__).parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
FIGURES_DIR = BASE_DIR / "data" / "figures"
REPORTS_DIR = BASE_DIR / "data" / "reports"

STATE_NAMES = {
    "AC": "Acre", "AL": "Alagoas", "AP": "Amapá", "AM": "Amazonas",
    "BA": "Bahia", "CE": "Ceará", "DF": "Distrito Federal", "ES": "Espírito Santo",
    "GO": "Goiás", "MA": "Maranhão", "MT": "Mato Grosso", "MS": "Mato Grosso do Sul",
    "MG": "Minas Gerais", "PA": "Pará", "PB": "Paraíba", "PR": "Paraná",
    "PE": "Pernambuco", "PI": "Piauí", "RJ": "Rio de Janeiro", "RN": "Rio Grande do Norte",
    "RS": "Rio Grande do Sul", "RO": "Rondônia", "RR": "Roraima", "SC": "Santa Catarina",
    "SP": "São Paulo", "SE": "Sergipe", "TO": "Tocantins",
}

TARGET_ON_TIME_RATE = 95.0
TARGET_AVG_DELIVERY = 10.0
TARGET_REVIEW = 4.5
TARGET_LATE_RATE = 5.0


def state_label(code: str) -> str:
    return f"{code} — {STATE_NAMES.get(code, code)}"


# ============================================================
# LOAD DATA
# ============================================================
@st.cache_data
def load_data():
    data = {}
    if (PROCESSED_DIR / "order_level_dataset.csv").exists():
        df = pd.read_csv(PROCESSED_DIR / "order_level_dataset.csv")
        df["order_purchase_timestamp"] = pd.to_datetime(df["order_purchase_timestamp"], errors="coerce")
        data["order_level"] = df

    if (PROCESSED_DIR / "item_level_dataset.csv").exists():
        data["item_level"] = pd.read_csv(PROCESSED_DIR / "item_level_dataset.csv")

    if (PROCESSED_DIR / "state_level_enhanced.csv").exists():
        data["state_level"] = pd.read_csv(PROCESSED_DIR / "state_level_enhanced.csv")

    if (PROCESSED_DIR / "route_level_enhanced.csv").exists():
        data["route_level"] = pd.read_csv(PROCESSED_DIR / "route_level_enhanced.csv")

    if (REPORTS_DIR / "01_delivery_audit.csv").exists():
        data["delivery_audit"] = pd.read_csv(REPORTS_DIR / "01_delivery_audit.csv")

    if (REPORTS_DIR / "05_review_compare.csv").exists():
        data["review_compare"] = pd.read_csv(REPORTS_DIR / "05_review_compare.csv")

    return data


data = load_data()


# ============================================================
# KPI CARD HELPER
# ============================================================
def kpi_card(
    icon: str,
    label: str,
    value: str,
    unit: str = "",
    delta: str | None = None,
    delta_kind: str = "neutral",  # up-good, up-bad, down-good, down-bad, neutral
    target_text: str | None = None,
    target_met: bool | None = None,
    accent: str = "#a78bfa",
    accent_bg: str = "rgba(167, 139, 250, 0.15)",
    glow: str = "rgba(167, 139, 250, 0.25)",
) -> str:
    arrow = ""
    if delta_kind in ("up-good", "up-bad"):
        arrow = "▲"
    elif delta_kind in ("down-good", "down-bad"):
        arrow = "▼"

    delta_html = ""
    if delta:
        delta_html = f'<div class="kpi-delta {delta_kind}">{arrow} {delta}</div>'

    target_html = ""
    if target_text:
        cls = "met" if target_met else "miss"
        icon_t = "✓" if target_met else "◷"
        target_html = f'<div class="kpi-target {cls}">{icon_t} {target_text}</div>'

    return (
        f'<div class="kpi-card" style="--accent: {accent}; --accent-bg: {accent_bg}; --glow: {glow};">'
        f'<div class="kpi-icon">{icon}</div>'
        f'<div class="kpi-label">{label}</div>'
        f'<div class="kpi-value">{value}<span class="kpi-unit">{unit}</span></div>'
        f'{delta_html}'
        f'{target_html}'
        f'</div>'
    )


# ============================================================
# SIDEBAR — navigation + global filters
# ============================================================
with st.sidebar:
    st.markdown(
        """
        <div style="padding: 0 0.5rem 1rem 0.5rem; border-bottom: 1px solid rgba(148,163,184,0.1); margin-bottom: 1rem;">
            <h1 style="margin:0;">◆ OLIST</h1>
            <p style="color:#64748b; font-size:0.75rem; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em;">
                Logistics Intelligence
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("### Navigation")
    page = st.radio(
        "Chọn trang:",
        ["📈 Tổng Quan", "🚚 Logistics", "⭐ Đánh Giá", "📊 Báo Cáo", "🔍 Dữ Liệu Chi Tiết"],
        label_visibility="collapsed",
    )

    st.markdown("---")
    st.markdown("### Bộ Lọc Toàn Cục")

    date_range = None
    selected_states: list[str] = []
    if "order_level" in data:
        order_df_raw = data["order_level"]
        valid_dates = order_df_raw["order_purchase_timestamp"].dropna()
        if len(valid_dates) > 0:
            min_d = valid_dates.min().date()
            max_d = valid_dates.max().date()
            date_range = st.date_input(
                "Khoảng thời gian",
                value=(min_d, max_d),
                min_value=min_d,
                max_value=max_d,
                help="Lọc đơn hàng theo ngày đặt hàng",
            )
        states_avail = sorted(order_df_raw["customer_state"].dropna().unique().tolist())
        selected_states = st.multiselect(
            "Tỉnh/Thành",
            options=states_avail,
            default=[],
            format_func=state_label,
            help="Để trống = chọn tất cả",
        )

    st.markdown("---")
    st.caption("Bộ lọc áp dụng cho Tổng Quan & Đánh Giá")


# ============================================================
# FILTER HELPERS
# ============================================================
def apply_filters(df: pd.DataFrame) -> pd.DataFrame:
    out = df
    if date_range and isinstance(date_range, tuple) and len(date_range) == 2:
        start, end = date_range
        out = out[
            (out["order_purchase_timestamp"].dt.date >= start)
            & (out["order_purchase_timestamp"].dt.date <= end)
        ]
    if selected_states:
        out = out[out["customer_state"].isin(selected_states)]
    return out


def previous_period(df_full: pd.DataFrame) -> pd.DataFrame | None:
    if not (date_range and isinstance(date_range, tuple) and len(date_range) == 2):
        return None
    start, end = date_range
    period_len = (pd.Timestamp(end) - pd.Timestamp(start)).days + 1
    prev_end = pd.Timestamp(start) - pd.Timedelta(days=1)
    prev_start = prev_end - pd.Timedelta(days=period_len - 1)
    prev = df_full[
        (df_full["order_purchase_timestamp"].dt.date >= prev_start.date())
        & (df_full["order_purchase_timestamp"].dt.date <= prev_end.date())
    ]
    if selected_states:
        prev = prev[prev["customer_state"].isin(selected_states)]
    return prev if len(prev) > 0 else None


# ============================================================
# PAGE 1: OVERVIEW
# ============================================================
if page == "📈 Tổng Quan":
    st.markdown(
        """
        <div class="title-block">
            <h1>OLIST Logistics Dashboard</h1>
            <span class="title-badge"><span class="live-dot"></span> LIVE</span>
        </div>
        <p class="subtitle">Phân tích toàn diện hiệu suất vận chuyển & dịch vụ khách hàng — dữ liệu từ Brazilian e-commerce</p>
        """,
        unsafe_allow_html=True,
    )

    if "order_level" in data:
        order_full = data["order_level"]
        order_df = apply_filters(order_full)
        prev_df = previous_period(order_full)

        # --- Filter chips ---
        chips = []
        if date_range and isinstance(date_range, tuple) and len(date_range) == 2:
            chips.append(f"📅 {date_range[0]} → {date_range[1]}")
        chips.append(f"📍 {len(selected_states) if selected_states else 'Tất cả'} tỉnh")
        chips.append(f"🧾 {len(order_df):,} đơn")
        if prev_df is not None:
            chips.append(f"⏱ vs kỳ trước ({len(prev_df):,} đơn)")
        st.markdown(
            f'<div class="filter-bar">{"".join(f"<span class=\'filter-chip\'>{c}</span>" for c in chips)}</div>',
            unsafe_allow_html=True,
        )

        # --- KPI cards ---
        total_orders = len(order_df)
        prev_orders = len(prev_df) if prev_df is not None else None

        late_count = int(order_df["late_flag"].sum()) if total_orders > 0 else 0
        late_rate = (late_count / total_orders * 100) if total_orders > 0 else 0
        prev_late_rate = (
            prev_df["late_flag"].sum() / len(prev_df) * 100
            if prev_df is not None and len(prev_df) > 0
            else None
        )

        avg_delivery = order_df["delivery_days"].mean() if total_orders > 0 else 0
        prev_avg = prev_df["delivery_days"].mean() if (prev_df is not None and len(prev_df) > 0) else None

        avg_review = order_df["review_score"].mean() if (total_orders > 0 and "review_score" in order_df.columns) else 0
        prev_review = (
            prev_df["review_score"].mean()
            if (prev_df is not None and "review_score" in prev_df.columns and len(prev_df) > 0)
            else None
        )

        # Card 1: total orders (purple)
        d1 = None
        d1_kind = "neutral"
        if prev_orders and prev_orders > 0:
            diff_pct = (total_orders - prev_orders) / prev_orders * 100
            d1 = f"{abs(diff_pct):.1f}% vs kỳ trước"
            d1_kind = "up-good" if diff_pct >= 0 else "down-bad"

        # Card 2: late rate (rose) — up = bad
        d2 = None
        d2_kind = "neutral"
        if prev_late_rate is not None:
            diff = late_rate - prev_late_rate
            d2 = f"{abs(diff):.1f} điểm % vs kỳ trước"
            d2_kind = "up-bad" if diff > 0 else "down-good"
        t2_met = late_rate <= TARGET_LATE_RATE
        t2_text = f"Mục tiêu ≤ {TARGET_LATE_RATE:.0f}%"

        # Card 3: avg delivery days (cyan) — up = bad
        d3 = None
        d3_kind = "neutral"
        if prev_avg is not None:
            diff = avg_delivery - prev_avg
            d3 = f"{abs(diff):.1f} ngày vs kỳ trước"
            d3_kind = "up-bad" if diff > 0 else "down-good"
        t3_met = avg_delivery <= TARGET_AVG_DELIVERY
        t3_text = f"Mục tiêu ≤ {TARGET_AVG_DELIVERY:.0f} ngày"

        # Card 4: review (amber) — up = good
        d4 = None
        d4_kind = "neutral"
        if prev_review is not None:
            diff = avg_review - prev_review
            d4 = f"{abs(diff):.2f} điểm vs kỳ trước"
            d4_kind = "up-good" if diff >= 0 else "down-bad"
        t4_met = avg_review >= TARGET_REVIEW
        t4_text = f"Mục tiêu ≥ {TARGET_REVIEW}"

        cards_html = (
            kpi_card("📦", "Tổng Đơn Hàng", f"{total_orders:,}",
                     delta=d1, delta_kind=d1_kind,
                     accent="#a78bfa", accent_bg="rgba(167,139,250,0.15)", glow="rgba(167,139,250,0.25)")
            + kpi_card("⏰", "Tỷ Lệ Đơn Trễ", f"{late_rate:.1f}", "%",
                       delta=d2, delta_kind=d2_kind,
                       target_text=t2_text, target_met=t2_met,
                       accent="#f43f5e", accent_bg="rgba(244,63,94,0.15)", glow="rgba(244,63,94,0.25)")
            + kpi_card("🚚", "Ngày Giao Trung Bình", f"{avg_delivery:.1f}", "ngày",
                       delta=d3, delta_kind=d3_kind,
                       target_text=t3_text, target_met=t3_met,
                       accent="#22d3ee", accent_bg="rgba(34,211,238,0.15)", glow="rgba(34,211,238,0.25)")
            + kpi_card("⭐", "Điểm Đánh Giá", f"{avg_review:.2f}", "/ 5",
                       delta=d4, delta_kind=d4_kind,
                       target_text=t4_text, target_met=t4_met,
                       accent="#f59e0b", accent_bg="rgba(245,158,11,0.15)", glow="rgba(245,158,11,0.25)")
        )
        st.markdown(f'<div class="kpi-grid">{cards_html}</div>', unsafe_allow_html=True)

        # ----- Insight panels -----
        st.markdown("## Các Chỉ Số Chính")

        col1, col2 = st.columns(2)

        with col1:
            on_time_r = 100 - late_rate
            over_60 = int((order_df["delivery_days"] > 60).sum()) if total_orders > 0 else 0
            over_100 = int((order_df["delivery_days"] > 100).sum()) if total_orders > 0 else 0

            on_time_badge = "badge-ok" if on_time_r >= TARGET_ON_TIME_RATE else "badge-warn"
            avg_badge = "badge-ok" if avg_delivery <= TARGET_AVG_DELIVERY else "badge-warn"
            over_60_badge = "badge-warn" if over_60 > 0 else "badge-ok"
            over_100_badge = "badge-bad" if over_100 > 50 else ("badge-warn" if over_100 > 0 else "badge-ok")

            html = (
                '<div class="insight-card">'
                '<h4>🚚 Hiệu Suất Giao Hàng</h4>'
                f'<div class="insight-row"><span class="insight-label">Trung bình giao hàng</span>'
                f'<span><span class="insight-value">{avg_delivery:.1f}</span> ngày '
                f'<span class="{avg_badge}">≤ {TARGET_AVG_DELIVERY:.0f}</span></span></div>'
                f'<div class="insight-row"><span class="insight-label">Tỷ lệ đúng hạn</span>'
                f'<span><span class="insight-value">{on_time_r:.1f}%</span> '
                f'<span class="{on_time_badge}">≥ {TARGET_ON_TIME_RATE:.0f}%</span></span></div>'
                f'<div class="insight-row"><span class="insight-label">Đơn quá 60 ngày</span>'
                f'<span><span class="insight-value">{over_60:,}</span> '
                f'<span class="{over_60_badge}">đơn</span></span></div>'
                f'<div class="insight-row"><span class="insight-label">Đơn quá 100 ngày</span>'
                f'<span><span class="insight-value">{over_100:,}</span> '
                f'<span class="{over_100_badge}">đơn</span></span></div>'
                '</div>'
            )
            st.markdown(html, unsafe_allow_html=True)

        with col2:
            if "state_level" in data:
                state_df = data["state_level"].copy()
                if selected_states:
                    state_df = state_df[state_df["customer_state"].isin(selected_states)]
                state_df = state_df.sort_values("num_orders", ascending=False).head(5)

                rows_html = ""
                for _, r in state_df.iterrows():
                    late_pct = r["late_rate_pct"]
                    late_class = (
                        "badge-ok" if late_pct <= TARGET_LATE_RATE
                        else ("badge-warn" if late_pct <= 10 else "badge-bad")
                    )
                    rows_html += (
                        '<div class="insight-row">'
                        f'<span class="insight-label">{state_label(r["customer_state"])}</span>'
                        f'<span><span class="insight-value">{r["num_orders"]:,.0f}</span> '
                        f'<span class="{late_class}">{late_pct:.1f}% trễ</span> '
                        f'<span style="color:#f59e0b; font-weight:600;">{r["avg_review_score"]:.2f}★</span>'
                        '</span></div>'
                    )
                st.markdown(
                    '<div class="insight-card">'
                    '<h4>🏆 Top 5 Tỉnh/Thành Theo Số Đơn</h4>'
                    f'{rows_html}'
                    '</div>',
                    unsafe_allow_html=True,
                )

        # ----- Charts -----
        st.markdown("## Biểu Đồ Trực Quan")

        col1, col2 = st.columns(2)
        with col1:
            if (FIGURES_DIR / "01_monthly_order_trend.html").exists():
                st.markdown("#### Xu Hướng Đơn Hàng Theo Tháng")
                with open(FIGURES_DIR / "01_monthly_order_trend.html", "r", encoding="utf-8") as f:
                    st.components.v1.html(f.read(), height=400, scrolling=False)

        with col2:
            if (FIGURES_DIR / "02_top_customer_states.html").exists():
                st.markdown("#### Top 15 Tỉnh/Thành Phố")
                with open(FIGURES_DIR / "02_top_customer_states.html", "r", encoding="utf-8") as f:
                    st.components.v1.html(f.read(), height=400, scrolling=False)

        col1, col2 = st.columns(2)
        with col1:
            if (FIGURES_DIR / "03_delivery_days_distribution.html").exists():
                st.markdown("#### Phân Bố Thời Gian Giao Hàng")
                with open(FIGURES_DIR / "03_delivery_days_distribution.html", "r", encoding="utf-8") as f:
                    st.components.v1.html(f.read(), height=400, scrolling=False)

        with col2:
            if (FIGURES_DIR / "04_late_rate_by_state.html").exists():
                st.markdown("#### Tỷ Lệ Giao Hàng Trễ")
                with open(FIGURES_DIR / "04_late_rate_by_state.html", "r", encoding="utf-8") as f:
                    st.components.v1.html(f.read(), height=400, scrolling=False)

# ============================================================
# PAGE 2: LOGISTICS
# ============================================================
elif page == "🚚 Logistics":
    st.markdown(
        '<div class="title-block"><h1>Phân Tích Logistics</h1></div>'
        '<p class="subtitle">Tuyến đường, GMV, phí vận chuyển</p>',
        unsafe_allow_html=True,
    )

    col1, col2 = st.columns(2)
    with col1:
        if (FIGURES_DIR / "05_top_routes_by_gmv.html").exists():
            st.markdown("## Tuyến Hàng Đầu Theo GMV")
            with open(FIGURES_DIR / "05_top_routes_by_gmv.html", "r", encoding="utf-8") as f:
                st.components.v1.html(f.read(), height=500, scrolling=False)
    with col2:
        if (FIGURES_DIR / "07_category_freight_ratio.html").exists():
            st.markdown("## Tỷ Lệ Vận Chuyển Theo Danh Mục")
            with open(FIGURES_DIR / "07_category_freight_ratio.html", "r", encoding="utf-8") as f:
                st.components.v1.html(f.read(), height=500, scrolling=False)

    if (FIGURES_DIR / "06_price_vs_freight.html").exists():
        st.markdown("## Phân Tích Giá Sản Phẩm vs Phí Vận Chuyển")
        with open(FIGURES_DIR / "06_price_vs_freight.html", "r", encoding="utf-8") as f:
            st.components.v1.html(f.read(), height=500, scrolling=False)

    if "route_level" in data:
        st.markdown("## Thống Kê Tuyến Đường")
        route_df = data["route_level"].sort_values("total_gmv", ascending=False).head(10)
        col1, col2 = st.columns(2)
        with col1:
            st.dataframe(
                route_df[
                    ["seller_state", "customer_state", "num_orders", "total_gmv", "avg_delivery_days", "late_rate"]
                ].head(5),
                use_container_width=True,
            )
        with col2:
            fig = px.bar(
                route_df.head(10),
                x="route", y="total_gmv",
                title="Top 10 Tuyến Đường Theo GMV",
                color="late_rate",
                color_continuous_scale=["#22d3ee", "#a78bfa", "#f43f5e"],
                template="plotly_dark",
            )
            fig.update_layout(
                height=400,
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(20,27,45,0.6)",
                font=dict(color="#e2e8f0"),
            )
            st.plotly_chart(fig, use_container_width=True)

# ============================================================
# PAGE 3: REVIEWS
# ============================================================
elif page == "⭐ Đánh Giá":
    st.markdown(
        '<div class="title-block"><h1>Phân Tích Đánh Giá</h1></div>'
        '<p class="subtitle">Mức độ hài lòng của khách hàng</p>',
        unsafe_allow_html=True,
    )

    col1, col2 = st.columns(2)
    with col1:
        if (FIGURES_DIR / "08_review_score_late_vs_ontime.html").exists():
            st.markdown("## So Sánh Điểm Đánh Giá")
            with open(FIGURES_DIR / "08_review_score_late_vs_ontime.html", "r", encoding="utf-8") as f:
                st.components.v1.html(f.read(), height=400, scrolling=False)

    with col2:
        if (FIGURES_DIR / "09_review_score_distribution.html").exists():
            st.markdown("## Phân Bố Điểm Đánh Giá")
            with open(FIGURES_DIR / "09_review_score_distribution.html", "r", encoding="utf-8") as f:
                st.components.v1.html(f.read(), height=400, scrolling=False)

    if "review_compare" in data:
        st.markdown("## Tóm Tắt Thống Kê Đánh Giá")
        review_df = data["review_compare"]
        cols = st.columns(len(review_df))
        accent_map = ["#10b981", "#f43f5e", "#f59e0b"]
        for i, (_, row) in enumerate(review_df.iterrows()):
            accent = accent_map[i % len(accent_map)]
            with cols[i]:
                st.markdown(
                    kpi_card(
                        "📋",
                        f"{row['delivery_status']}",
                        f"{row['avg_review_score']:.2f}",
                        "★",
                        delta=f"{row['num_orders']:.0f} đơn · {row['low_review_rate_pct']:.1f}% đánh giá thấp",
                        delta_kind="neutral",
                        accent=accent,
                        accent_bg=f"{accent}26",
                        glow=f"{accent}40",
                    ),
                    unsafe_allow_html=True,
                )

# ============================================================
# PAGE 4: REPORTS
# ============================================================
elif page == "📊 Báo Cáo":
    st.markdown(
        '<div class="title-block"><h1>Báo Cáo Chi Tiết</h1></div>'
        '<p class="subtitle">Tổng hợp số liệu theo tỉnh, tuyến đường, kiểm toán giao hàng</p>',
        unsafe_allow_html=True,
    )

    if "state_level" in data:
        st.markdown("## Hiệu Suất Theo Tỉnh/Thành Phố")
        state_df = data["state_level"].sort_values("num_orders", ascending=False).copy()
        state_df["customer_state"] = state_df["customer_state"].map(state_label)
        st.dataframe(
            state_df[
                ["customer_state", "num_orders", "late_rate_pct", "avg_delivery_days", "avg_review_score"]
            ],
            use_container_width=True,
            hide_index=True,
        )

    if "route_level" in data:
        st.markdown("## Hiệu Suất Theo Tuyến Đường")
        route_df = data["route_level"].sort_values("total_gmv", ascending=False).head(20)
        st.dataframe(
            route_df[["route", "num_orders", "total_gmv", "avg_freight", "avg_delivery_days", "late_rate"]],
            use_container_width=True,
            hide_index=True,
        )

    if "delivery_audit" in data:
        st.markdown("## Kiểm Toán Hiệu Suất Giao Hàng")
        st.table(data["delivery_audit"])

# ============================================================
# PAGE 5: DATA TABLES
# ============================================================
elif page == "🔍 Dữ Liệu Chi Tiết":
    st.markdown(
        '<div class="title-block"><h1>Bảng Dữ Liệu Chi Tiết</h1></div>'
        '<p class="subtitle">Khám phá dữ liệu thô theo nhiều cấp độ</p>',
        unsafe_allow_html=True,
    )

    sub_page = st.selectbox(
        "Chọn Bảng Dữ Liệu:",
        ["Cấp Đơn Hàng", "Cấp Mặt Hàng", "Cấp Tỉnh/Thành", "Cấp Tuyến Đường"],
    )

    if sub_page == "Cấp Đơn Hàng" and "order_level" in data:
        st.markdown("## Bộ Dữ Liệu Cấp Đơn Hàng")
        col1, col2, col3 = st.columns(3)
        with col1:
            show_late_only = st.checkbox("Chỉ Hiển Thị Đơn Hàng Trễ", value=False)
        with col2:
            min_days = st.number_input("Số Ngày Giao Tối Thiểu", value=0)
        with col3:
            max_days = st.number_input("Số Ngày Giao Tối Đa", value=100)

        df = data["order_level"].copy()
        if show_late_only:
            df = df[df["late_flag"] == True]
        df = df[(df["delivery_days"] >= min_days) & (df["delivery_days"] <= max_days)]

        st.markdown(
            kpi_card("🧾", "Bản Ghi Được Lọc", f"{len(df):,}",
                     accent="#a78bfa", accent_bg="rgba(167,139,250,0.15)"),
            unsafe_allow_html=True,
        )
        st.dataframe(
            df[["order_id", "customer_state", "delivery_days", "late_flag", "review_score"]].head(100),
            use_container_width=True,
            hide_index=True,
        )

    elif sub_page == "Cấp Mặt Hàng" and "item_level" in data:
        st.markdown("## Bộ Dữ Liệu Cấp Mặt Hàng")
        df = data["item_level"].copy()
        states = ["Tất Cả"] + sorted(df["customer_state"].dropna().unique().tolist())
        selected_state = st.selectbox("Lọc Theo Tỉnh/Thành Phố Khách Hàng:", states)
        if selected_state != "Tất Cả":
            df = df[df["customer_state"] == selected_state]
        st.dataframe(
            df[["order_id", "seller_state", "customer_state", "price", "freight_value", "delivery_days"]].head(100),
            use_container_width=True,
            hide_index=True,
        )

    elif sub_page == "Cấp Tỉnh/Thành" and "state_level" in data:
        st.markdown("## Bộ Dữ Liệu Cấp Tỉnh/Thành Phố")
        st.dataframe(
            data["state_level"].sort_values("num_orders", ascending=False),
            use_container_width=True,
            hide_index=True,
        )

    elif sub_page == "Cấp Tuyến Đường" and "route_level" in data:
        st.markdown("## Bộ Dữ Liệu Cấp Tuyến Đường")
        st.dataframe(
            data["route_level"].sort_values("total_gmv", ascending=False),
            use_container_width=True,
            hide_index=True,
        )

# ============================================================
# FOOTER
# ============================================================
st.markdown(
    """
    <div style='text-align:center; color:#475569; font-size:0.78rem; margin-top: 3rem; padding: 1.5rem 0; border-top: 1px solid rgba(148,163,184,0.1);'>
        ◆ OLIST Logistics Intelligence · Brazilian E-commerce Dataset
    </div>
    """,
    unsafe_allow_html=True,
)
