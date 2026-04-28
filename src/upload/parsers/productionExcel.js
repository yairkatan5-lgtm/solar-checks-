import * as XLSX from 'xlsx';

// Parses the "ייצור מערכות סולאריות" workbook in the browser.
// Returns null if the workbook doesn't look like the production sheet.
//
// Output shape includes:
//   - per-system metrics with efficiency vs. group benchmark (group average specific-yield)
//   - health: faulty (zero production) + underperformers (significantly below avg)
//   - leaderboard: top performers
//   - environmental impact
export async function parseProductionExcel(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheetName = wb.SheetNames.find((n) => /info/i.test(n)) || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  if (!ws) return null;
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });

  const headerIdx = rows.findIndex((r) =>
    Array.isArray(r) &&
    r.some((c) => typeof c === 'string' && /period/i.test(c)) &&
    r.some((c) => typeof c === 'string' && /capacity/i.test(c)) &&
    r.some((c) => typeof c === 'string' && /production/i.test(c)),
  );
  if (headerIdx === -1) return null;

  const period = rows[0]?.[0] || rows[headerIdx]?.[0] || '';

  const systems = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[1]) continue;
    const name = String(r[1]).trim();
    const capacity = parseFloat(r[2]);
    const production = parseFloat(r[3]);
    const tariff = parseFloat(r[4]);
    if (!isFinite(capacity)) continue;
    const safeProd = isFinite(production) ? production : 0;
    const id = systems.length + 1;
    const safeTariff = isFinite(tariff) ? tariff : 0;
    const revenue = safeProd * safeTariff;
    const specificYield = capacity > 0 ? safeProd / capacity : 0;
    systems.push({
      id,
      name,
      capacity_kwp: +capacity.toFixed(2),
      production_kwh: +safeProd.toFixed(2),
      tariff_nis_per_kwh: +safeTariff.toFixed(4),
      revenue_nis: +revenue.toFixed(2),
      specific_yield_kwh_per_kwp: +specificYield.toFixed(2),
    });
  }
  if (!systems.length) return null;

  const total_capacity = systems.reduce((s, x) => s + x.capacity_kwp, 0);
  const total_production = systems.reduce((s, x) => s + x.production_kwh, 0);
  const total_revenue = systems.reduce((s, x) => s + x.revenue_nis, 0);
  const avg_yield = total_capacity > 0 ? total_production / total_capacity : 0;
  const weightedTariff = total_production > 0 ? total_revenue / total_production : 0;

  // Group benchmark = capacity-weighted average specific yield (which equals total_prod / total_cap)
  const benchmark = avg_yield;

  // Health classification thresholds (relative to benchmark)
  const FAULTY_THRESHOLD = 0.05;       // <5% of avg = effectively dead
  const UNDERPERFORM_THRESHOLD = 0.7;  // <70% of avg = needs attention
  const TOP_THRESHOLD = 1.15;          // >115% of avg = top performer

  const enriched = systems.map((s) => {
    const ratio = benchmark > 0 ? s.specific_yield_kwh_per_kwp / benchmark : 0;
    const expected_kwh = +(s.capacity_kwp * benchmark).toFixed(2);
    const gap_kwh = +(expected_kwh - s.production_kwh).toFixed(2);
    const deviation_pct = +((ratio - 1) * 100).toFixed(1); // negative = below avg
    let status = 'normal';
    if (s.capacity_kwp > 0 && ratio < FAULTY_THRESHOLD) status = 'faulty';
    else if (ratio < UNDERPERFORM_THRESHOLD) status = 'underperforming';
    else if (ratio > TOP_THRESHOLD) status = 'top';
    return { ...s, efficiency_ratio: +ratio.toFixed(3), expected_kwh, gap_kwh, deviation_pct, status };
  });

  const faulty = enriched.filter((s) => s.status === 'faulty');
  const underperformers = enriched.filter((s) => s.status === 'underperforming');
  const topPerformers = [...enriched]
    .filter((s) => s.status !== 'faulty')
    .sort((a, b) => b.specific_yield_kwh_per_kwp - a.specific_yield_kwh_per_kwp);
  const ranked = [...enriched].sort((a, b) => b.specific_yield_kwh_per_kwp - a.specific_yield_kwh_per_kwp);

  // Stats: median + std-dev of yield (only over systems with non-zero capacity)
  const yields = enriched.filter((s) => s.capacity_kwp > 0).map((s) => s.specific_yield_kwh_per_kwp);
  const yieldsSorted = [...yields].sort((a, b) => a - b);
  const median_yield = yieldsSorted.length
    ? yieldsSorted.length % 2
      ? yieldsSorted[(yieldsSorted.length - 1) / 2]
      : (yieldsSorted[yieldsSorted.length / 2 - 1] + yieldsSorted[yieldsSorted.length / 2]) / 2
    : 0;
  const variance = yields.length
    ? yields.reduce((s, y) => s + (y - benchmark) ** 2, 0) / yields.length
    : 0;
  const std_dev_yield = Math.sqrt(variance);

  const lost_kwh = underperformers.reduce((s, u) => s + Math.max(0, u.gap_kwh), 0);
  const lost_revenue_nis = underperformers.reduce(
    (s, u) => s + Math.max(0, u.gap_kwh) * (u.tariff_nis_per_kwh || weightedTariff),
    0,
  );

  const CO2_KG_PER_KWH = 0.434;
  const co2_kg = total_production * CO2_KG_PER_KWH;

  return {
    period,
    generated_at: new Date().toISOString(),
    sourceFile: file.name,
    totals: {
      systems_count: systems.length,
      total_capacity_kwp: +total_capacity.toFixed(2),
      total_production_kwh: +total_production.toFixed(2),
      total_revenue_nis: +total_revenue.toFixed(2),
      avg_specific_yield_kwh_per_kwp: +avg_yield.toFixed(2),
      median_specific_yield_kwh_per_kwp: +median_yield.toFixed(2),
      std_dev_yield_kwh_per_kwp: +std_dev_yield.toFixed(2),
      weighted_avg_tariff_nis_per_kwh: +weightedTariff.toFixed(4),
      group_benchmark_kwh_per_kwp: +benchmark.toFixed(2),
      thresholds: {
        faulty_max_ratio: FAULTY_THRESHOLD,
        underperform_max_ratio: UNDERPERFORM_THRESHOLD,
        top_min_ratio: TOP_THRESHOLD,
      },
    },
    health: {
      faulty_count: faulty.length,
      underperformer_count: underperformers.length,
      top_count: enriched.filter((s) => s.status === 'top').length,
      lost_kwh: +lost_kwh.toFixed(2),
      lost_revenue_nis: +lost_revenue_nis.toFixed(2),
      faulty,
      underperformers,
    },
    environmental: {
      co2_kg_per_kwh: CO2_KG_PER_KWH,
      co2_kg_saved: +co2_kg.toFixed(2),
      co2_tons_saved: +(co2_kg / 1000).toFixed(2),
      trees_equivalent_year: Math.round(co2_kg / 21),
      cars_equivalent_year: +(co2_kg / 4600).toFixed(2),
      km_equivalent: Math.round(co2_kg / 0.12),
      households_powered_month: +(total_production / 583).toFixed(1),
      coal_kg_saved: Math.round(total_production * 0.45),
      smartphone_charges: Math.round(total_production / 0.012),
    },
    underperformers, // kept for backwards-compat with existing components
    top5: topPerformers.slice(0, 5),
    bottom5: ranked.slice(-5).reverse(),
    systems: enriched,
  };
}

export async function looksLikeProduction(file) {
  try {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    for (const n of wb.SheetNames) {
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false, defval: null });
      const ok = rows.some((r) =>
        Array.isArray(r) &&
        r.some((c) => typeof c === 'string' && /capacity/i.test(c)) &&
        r.some((c) => typeof c === 'string' && /production/i.test(c)),
      );
      if (ok) return true;
    }
  } catch { /* ignore */ }
  return false;
}
