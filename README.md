# Solar Portfolio Dashboard ☀️

> An interactive, Hebrew (RTL) analytics dashboard for managing and monitoring a portfolio of solar energy systems — built from raw Excel data.

---

## Overview

This project transforms a raw Excel-based solar systems dataset into a fully interactive web dashboard. Instead of manually slicing data in spreadsheets, operators and analysts can instantly explore system performance, track revenue, identify underperformers, and quantify environmental impact — all in one place, in Hebrew.

The pipeline is simple: drop in an updated Excel file, run `npm run ingest`, and the dashboard reflects the latest data.

---

## Features

### 📊 Summary Table
A central, Excel-like view (columns A–L) with period filtering, clickable electricity bill references, and one-click **Excel export** using a pre-built template (ExcelJS).

### ⚡ KPI Cards
At-a-glance metrics: active systems, total installed capacity, cumulative production, total revenue, and portfolio specific yield.

### 📈 Performance Charts
- System rankings by production, revenue, and specific yield
- Scatter plot: capacity vs. production, benchmarked against **135 kWh/kWp** (March standard)
- Instant identification of over- and under-performers

### 🔍 Smart Insights
Automatically surfaces:
- Systems requiring attention
- Portfolio leaders
- Estimated lost revenue potential

### 🌍 Environmental Impact (Animated)
Visualizes CO₂ savings using Israel's grid emission factor (**0.434 kg CO₂/kWh**), with animated equivalents: trees saved, cars taken off the road, houses powered, phones charged, and factories offset. Numbers animate from 0 on load.

### 🗂️ Systems Table
Full searchable, sortable systems table with CSV export.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS (solar theme) |
| Charts | Recharts |
| Icons | lucide-react |
| Excel Export | ExcelJS |
| Data Pipeline | Node.js (`scripts/read-excel.cjs`) |

---

## Data Pipeline

The dashboard reads from `src/data/solar-data.json`, which is generated from the source Excel file:

```bash
npm run ingest
```

To point to a different Excel file, edit the path in `scripts/read-excel.cjs`.

---

## Methodology

- **Specific Yield**: `kWh / kWp` — normalizes production across systems of different sizes
- **March Benchmark**: 135 kWh/kWp (industry standard for Israel)
- **CO₂ Savings**: based on Israel grid factor of **0.434 kg CO₂/kWh**
- **CO₂ Equivalents**: tree absorbs ~21 kg/year, average car emits ~4,600 kg/year
- **Revenue**: `Production × weighted tariff` per system

---

## Project Structure

```
solar-dashboard/
├── scripts/
│   ├── read-excel.cjs       # Parses Excel → JSON
│   └── compute.cjs          # KPI & metric calculations
├── src/
│   ├── components/          # Header, KPICards, Charts, InsightsPanel, etc.
│   ├── data/
│   │   └── solar-data.json  # Generated data source
│   └── utils/
│       └── format.js        # Number & date formatting helpers
└── public/
    └── templates/
        └── solar-summary-template.xlsx  # Excel export template
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Ingest data from Excel
npm run ingest

# Start development server
npm run dev
```

---

## License

MIT
