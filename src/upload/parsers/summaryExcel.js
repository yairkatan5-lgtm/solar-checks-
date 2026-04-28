import * as XLSX from 'xlsx';

// Parses the "סיכום סולארי" workbook into a list of period rollups.
// Each top-level row has a date range in col A like "19/12/2024-20/01/2025" with totals across columns.
function parseNumber(v) {
  if (v == null) return 0;
  const s = String(v).replace(/[,\s₪]/g, '').trim();
  if (!s || s === '-') return 0;
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}

const DATE_RANGE = /^\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s*-\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s*$/;

export async function parseSummaryExcel(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheetName = wb.SheetNames.find((n) => n.includes('סיכום')) || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  if (!ws) return null;
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });

  const periods = [];
  for (const r of rows) {
    if (!Array.isArray(r) || !r[0]) continue;
    const a = String(r[0]).trim();
    if (!DATE_RANGE.test(a)) continue;
    const [startStr, endStr] = a.split('-').map((x) => x.trim());
    periods.push({
      range: a,
      start: parseHebrewDate(startStr),
      end: parseHebrewDate(endStr),
      label: r[1] ? String(r[1]).trim() : '',
      production_kwh: parseNumber(r[2]),
      production_value_nis: parseNumber(r[3]),
      export_kwh: parseNumber(r[4]),
      export_value_nis: parseNumber(r[5]),
      self_consumption_kwh: parseNumber(r[6]),
      self_consumption_value_nis: parseNumber(r[7]),
      protection_fee_nis: parseNumber(r[8]),
      transport_fee_nis: parseNumber(r[9]),
      balance_fee_nis: parseNumber(r[10]),
      net_solar_profit_nis: parseNumber(r[11]),
    });
  }
  if (!periods.length) return null;

  const byKey = new Map();
  for (const p of periods) {
    const key = `${p.start || ''}|${p.end || ''}`;
    if (!byKey.has(key)) byKey.set(key, p);
  }
  const deduped = [...byKey.values()];
  deduped.sort((a, b) => (a.start || '').localeCompare(b.start || ''));

  const totals = periods.reduce(
    (acc, p) => ({
      production_kwh: acc.production_kwh + p.production_kwh,
      production_value_nis: acc.production_value_nis + p.production_value_nis,
      export_kwh: acc.export_kwh + p.export_kwh,
      export_value_nis: acc.export_value_nis + p.export_value_nis,
      self_consumption_kwh: acc.self_consumption_kwh + p.self_consumption_kwh,
      self_consumption_value_nis: acc.self_consumption_value_nis + p.self_consumption_value_nis,
      protection_fee_nis: acc.protection_fee_nis + p.protection_fee_nis,
      transport_fee_nis: acc.transport_fee_nis + p.transport_fee_nis,
      balance_fee_nis: acc.balance_fee_nis + p.balance_fee_nis,
      net_solar_profit_nis: acc.net_solar_profit_nis + p.net_solar_profit_nis,
    }),
    { production_kwh: 0, production_value_nis: 0, export_kwh: 0, export_value_nis: 0, self_consumption_kwh: 0, self_consumption_value_nis: 0, protection_fee_nis: 0, transport_fee_nis: 0, balance_fee_nis: 0, net_solar_profit_nis: 0 },
  );

  return {
    sourceFile: file.name,
    parsedAt: new Date().toISOString(),
    periods: deduped,
    totals: Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, +v.toFixed(2)])),
  };
}

function parseHebrewDate(s) {
  // dd/mm/yyyy → ISO yyyy-mm-dd
  const m = String(s || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  const dd = m[1].padStart(2, '0');
  const mm = m[2].padStart(2, '0');
  let yy = m[3];
  if (yy.length === 2) yy = '20' + yy;
  return `${yy}-${mm}-${dd}`;
}

export async function looksLikeSummary(file) {
  try {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    for (const n of wb.SheetNames) {
      if (n.includes('סיכום')) return true;
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false, defval: null });
      if (rows.some((r) => Array.isArray(r) && r[0] && DATE_RANGE.test(String(r[0])))) return true;
    }
  } catch { /* ignore */ }
  return false;
}
