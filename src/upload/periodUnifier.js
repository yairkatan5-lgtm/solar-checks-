// Period unifier: merges electricity bills with the solar summary file into a single
// per-period view. When a bill has no matching summary period (e.g. the most recent month
// has not yet been added to the summary excel), we synthesize one from the bill's net
// metering data so the customer always sees a complete chronological story.
//
// "Profit" semantics:
//   net_solar_profit_nis = revenue from the summary file (pre-existing)
//   bill_to_pay_nis      = what they actually pay the IEC for that period
//   recommendation_nis   = PV credit recommendation (negative = customer is owed)
//   period_net_nis       = net cash effect for the period: profit + (-bill) + (-credit applied)
//                          We compute this transparently per period.

function isoToTime(iso) {
  if (!iso) return 0;
  const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10));
  if (!y) return 0;
  return Date.UTC(y, (m || 1) - 1, d || 1);
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  const s = Math.max(isoToTime(aStart), isoToTime(bStart));
  const e = Math.min(isoToTime(aEnd), isoToTime(bEnd));
  return s <= e;
}

// Days of overlap between two date ranges (inclusive)
function overlapDays(aStart, aEnd, bStart, bEnd) {
  const s = Math.max(isoToTime(aStart), isoToTime(bStart));
  const e = Math.min(isoToTime(aEnd), isoToTime(bEnd));
  if (s > e) return 0;
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

function fmtDmy(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Build a synthetic summary period from a bill. Used when there's no overlapping
// summary entry. We rely on the bill's net metering production data + recommendation.
function syntheticSummaryFromBill(bill, fallbackTariff = 0) {
  const production = bill?.net?.production_kwh || bill?.pv?.production_kwh || 0;
  const exportKwh = bill?.net?.export_kwh || bill?.pv?.export_kwh || 0;
  const selfKwh = bill?.net?.self_consumption_kwh || bill?.pv?.self_consumption_kwh || 0;

  // Use the average tariff from the bill if available, otherwise fallback
  const tariff = (bill?.avg_price_agorot ? bill.avg_price_agorot / 100 : fallbackTariff);

  const export_value = +(exportKwh * tariff).toFixed(2);
  const self_value = +(selfKwh * tariff).toFixed(2);
  const production_value = +(export_value + self_value).toFixed(2);

  // Financial values from regulatory breakdown when available
  const reg = bill?.regulatoryBreakdown || {};
  const protection_fee = Math.abs(reg.protection_nis || 0);
  const transport_fee = Math.abs(reg.transmission_nis || 0);
  const balance_fee = Math.abs(reg.balance_nis || 0);

  // Net solar profit calculated EXACTLY like "Solar Summary" Excel:
  // Export Value + Protection Fee - Transmission Fee - Balance Fee
  const net_profit = +(export_value + protection_fee - transport_fee - balance_fee).toFixed(2);

  return {
    range: bill.periodLabel || `${fmtDmy(bill.periodStart)}-${fmtDmy(bill.periodEnd)}`,
    start: bill.periodStart,
    end: bill.periodEnd,
    label: 'משוחזר מחשבון',
    production_kwh: production,
    production_value_nis: production_value,
    export_kwh: exportKwh,
    export_value_nis: export_value,
    self_consumption_kwh: selfKwh,
    self_consumption_value_nis: self_value,
    protection_fee_nis: protection_fee,
    transport_fee_nis: transport_fee,
    balance_fee_nis: balance_fee,
    net_solar_profit_nis: net_profit,
    synthesized: true,
  };
}

// Returns array of unified period objects. Each has:
//   period (summary fields), bill (or null), source ∈ { 'summary', 'bill', 'both' }, kpis
export function unifyPeriods({ summary, bills = [], solar }) {
  const summaryPeriods = (summary?.periods || []).map((p) => ({ ...p }));
  const sortedBills = [...(bills || [])].sort((a, b) => (a.periodStart || '').localeCompare(b.periodStart || ''));
  const weightedTariff = solar?.totals?.weighted_avg_tariff_nis_per_kwh || 0;

  // Mark which bills have been linked to a summary period
  const linkedBillIds = new Set();

  // For each summary period, find best matching bill (by overlap)
  const enriched = summaryPeriods.map((p) => {
    let bestBill = null;
    let bestOverlap = 0;
    for (const b of sortedBills) {
      if (!b.periodStart || !b.periodEnd) continue;
      const ov = overlapDays(p.start, p.end, b.periodStart, b.periodEnd);
      if (ov > bestOverlap) {
        bestOverlap = ov;
        bestBill = b;
      }
    }
    if (bestBill) linkedBillIds.add(bestBill.invoiceNumber || bestBill.sourceFile);

    // If the summary period has zero/null production but we have a matching bill,
    // synthesize the missing fields from the bill data so the customer sees a complete view.
    let mergedPeriod = p;
    let synthesizedFromBill = false;
    const summaryEmpty = !p.production_kwh && !p.export_kwh && !p.self_consumption_kwh && !p.net_solar_profit_nis;
    if (summaryEmpty && bestBill) {
      const synth = syntheticSummaryFromBill(bestBill, weightedTariff);
      mergedPeriod = { ...p, ...synth, range: p.range || synth.range, start: p.start || synth.start, end: p.end || synth.end };
      synthesizedFromBill = true;
    }

    return {
      period: mergedPeriod,
      bill: bestBill,
      source: bestBill ? (synthesizedFromBill ? 'bill_only_summary_empty' : 'both') : 'summary',
      synthesizedFromBill,
    };
  });

  // Bills that were not linked -> synthesize periods only when there is no summary file
  // (if summary.periods exists, extra bills stay in data.bills only — avoids duplicate rows in the table)
  if (!summaryPeriods.length) {
    for (const b of sortedBills) {
      const id = b.invoiceNumber || b.sourceFile;
      if (linkedBillIds.has(id)) continue;
      const synthetic = syntheticSummaryFromBill(b, weightedTariff);
      enriched.push({ period: synthetic, bill: b, source: 'bill' });
    }
  }

  // Sort chronologically
  enriched.sort((a, b) => (a.period.start || '').localeCompare(b.period.start || ''));

  // Compute per-period KPIs
  for (const item of enriched) {
    const p = item.period;
    const b = item.bill;
    const billTotal = b?.total_to_pay_nis ?? null;
    const recommendation = b?.recommendation?.total_nis ?? null; // negative = customer is owed
    const profit = p.net_solar_profit_nis || 0;

    // Period net = solar profit (revenue) MINUS what they had to pay
    // Bill total can be small/negative when the previous month's PV credit covered it.
    const period_net = profit - (billTotal || 0);

    item.kpis = {
      production_kwh: p.production_kwh || 0,
      consumption_kwh: b?.consumption_kwh || 0,
      export_kwh: p.export_kwh || 0,
      self_consumption_kwh: p.self_consumption_kwh || 0,
      net_solar_profit_nis: +profit.toFixed(2),
      bill_to_pay_nis: billTotal != null ? +billTotal.toFixed(2) : null,
      recommendation_nis: recommendation != null ? +recommendation.toFixed(2) : null,
      period_net_nis: +period_net.toFixed(2),
    };
  }

  // Aggregate totals
  const totals = enriched.reduce(
    (acc, it) => ({
      production_kwh: acc.production_kwh + (it.kpis.production_kwh || 0),
      consumption_kwh: acc.consumption_kwh + (it.kpis.consumption_kwh || 0),
      export_kwh: acc.export_kwh + (it.kpis.export_kwh || 0),
      self_consumption_kwh: acc.self_consumption_kwh + (it.kpis.self_consumption_kwh || 0),
      net_solar_profit_nis: acc.net_solar_profit_nis + (it.kpis.net_solar_profit_nis || 0),
      bill_to_pay_nis: acc.bill_to_pay_nis + (it.kpis.bill_to_pay_nis || 0),
      period_net_nis: acc.period_net_nis + (it.kpis.period_net_nis || 0),
    }),
    {
      production_kwh: 0,
      consumption_kwh: 0,
      export_kwh: 0,
      self_consumption_kwh: 0,
      net_solar_profit_nis: 0,
      bill_to_pay_nis: 0,
      period_net_nis: 0,
    },
  );

  return {
    periods: enriched,
    totals: Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, +v.toFixed(2)])),
    counts: {
      total: enriched.length,
      summary: enriched.filter((i) => i.source === 'summary' || i.source === 'both').length,
      summary_only: enriched.filter((i) => i.source === 'summary').length,
      both: enriched.filter((i) => i.source === 'both').length,
      synthesized: enriched.filter((i) => i.source === 'bill' || i.source === 'bill_only_summary_empty').length,
    },
  };
}
