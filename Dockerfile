FROM python:3.12-slim

WORKDIR /app

# Install minimal runtime dependencies
COPY requirements.dashboard.txt ./
RUN pip install --no-cache-dir -r requirements.dashboard.txt

# Copy application files
COPY dashboard.py ./
COPY download_drive_data.py ./

# Create data directory structure
RUN mkdir -p /app/data/raw /app/data/processed /app/data/figures /app/data/reports

EXPOSE 8501

# Run the Streamlit dashboard
CMD ["streamlit", "run", "dashboard.py", "--server.port=8501", "--server.address=0.0.0.0", "--server.headless=true"]
