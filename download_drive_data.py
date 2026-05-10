from __future__ import annotations

import argparse
import shutil
from dataclasses import dataclass
from pathlib import Path

import gdown

# Baseline URL cho Google Drive UC
BASE_URL = "https://drive.google.com/uc?id={file_id}"

@dataclass(frozen=True)
class DownloadSpec:
    """Atomic Design: Định nghĩa cấu trúc tải tệp tin."""
    file_id: str
    output_name: str
    relative_dir: str

    @property
    def url(self) -> str:
        return BASE_URL.format(file_id=self.file_id)

    @property
    def destination(self) -> Path:
        return Path(self.relative_dir) / self.output_name

# Target Assets: Mapping 15 file cần thiết cho Dashboard V2.5
TARGET_FILES: list[DownloadSpec] = [
    # 1. Core Datasets (Processed)
    DownloadSpec("1u5qJDBh8KIi80AnMQGi2H0USYIeHEVvm", "order_level_dataset.csv", "data/processed"),
    DownloadSpec("1ouXc3RCoY3Sxy2tIZsu_RsCYtzU0nfUc", "item_level_dataset.csv", "data/processed"),
    DownloadSpec("1ZVluh01LHCZ_XUuj8o-ikwz5nujrf2ey", "state_level_enhanced.csv", "data/processed"),
    DownloadSpec("1VhM7QIOgdcqoxTBCu6AyO_4wOWRWn1sh", "route_level_enhanced.csv", "data/processed"),
    
    # 2. Audit Reports
    DownloadSpec("1dyww1DRx992tQjISpsX58E2zGqmzZ-rf", "01_delivery_audit.csv", "data/reports"),
    DownloadSpec("1uu9Gr_Kd6MaDslvhdNWiPjztf2Yyazzs", "05_review_compare.csv", "data/reports"),
    
    # 3. Visual Figures (Pre-rendered HTML plots)
    DownloadSpec("104uNpD47k7JhYscWdFrp0EEadGrpwuWm", "01_monthly_order_trend.html", "data/figures"),
    DownloadSpec("1bQujvOATdyDqTdZVRZCehOtKLeZpPAYH", "02_top_customer_states.html", "data/figures"),
    DownloadSpec("1ODrIPEZoj_CxiFN1NbqEvgE0-JjYsE56", "03_delivery_days_distribution.html", "data/figures"),
    DownloadSpec("1-WwMc8BSq1_MmLtdFInRrVTPRgaHS8B9", "04_late_rate_by_state.html", "data/figures"),
    DownloadSpec("1lvC5I1IZhogLMbUUH4Qw0cOSKwQnusf2", "05_top_routes_by_gmv.html", "data/figures"),
    DownloadSpec("1ovBKZLkj1jck343raiNzTIIPh-Y2bb_u", "06_price_vs_freight.html", "data/figures"),
    DownloadSpec("1KWxd6F_314gU7XLlFnlL2IKriW4uwuxB", "07_category_freight_ratio.html", "data/figures"),
    DownloadSpec("11kkAwQNUwZk8Rw2qDfCrrePf_NohaXSG", "08_review_score_late_vs_ontime.html", "data/figures"),
    DownloadSpec("1jH1N-WFb-nxyjV5-yMSvV75bxujvzIrx", "09_review_score_distribution.html", "data/figures"),
]

def download_file(spec: DownloadSpec, base_dir: Path, overwrite: bool = False) -> Path:
    """Xử lý logic tải file với cơ chế retry và ghi đè."""
    destination = base_dir / spec.destination
    destination.parent.mkdir(parents=True, exist_ok=True)

    if destination.exists() and not overwrite:
        return destination

    # Cơ chế tải tạm (Temporary file) để tránh lỗi file hỏng khi mất mạng
    temp_path = destination.with_suffix(destination.suffix + ".part")
    if temp_path.exists():
        temp_path.unlink()

    result = gdown.download(
        url=spec.url,
        output=str(temp_path),
        quiet=False,
        use_cookies=False,
    )
    
    if not result:
        raise RuntimeError(f"❌ Không tải được: {spec.output_name}")

    if destination.exists():
        destination.unlink()
    shutil.move(str(temp_path), str(destination))
    return destination

def main() -> None:
    parser = argparse.ArgumentParser(description="Olist Data Sync Automation.")
    parser.add_argument("--base-dir", default=Path(__file__).resolve().parent, type=Path)
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    print(f"🚀 Bắt đầu đồng bộ {len(TARGET_FILES)} tài nguyên từ Google Drive...")
    
    downloaded = []
    for spec in TARGET_FILES:
        try:
            p = download_file(spec, args.base_dir, overwrite=args.overwrite)
            downloaded.append(p)
        except Exception as e:
            print(f"⚠️ Cảnh báo: {e}")

    print(f"\n✅ Hoàn tất. Đã kiểm tra/tải {len(downloaded)} tệp tin.")

if __name__ == "__main__":
    main()