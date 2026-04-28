export const DATE_RANGE_RE = /^\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s*-\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s*$/;

/** Map period object (summary shape) to 12 columns A–L for a worksheet row. */
export function periodToRowValues(p) {
  return [
    p.range || '',
    p.label || '',
    p.production_kwh ?? 0,
    p.production_value_nis ?? 0,
    p.export_kwh ?? 0,
    p.export_value_nis ?? 0,
    p.self_consumption_kwh ?? 0,
    p.self_consumption_value_nis ?? 0,
    p.protection_fee_nis ?? 0,
    p.transport_fee_nis ?? 0,
    p.balance_fee_nis ?? 0,
    p.net_solar_profit_nis ?? 0,
  ];
}

export function sourceLabelForItem(item) {
  if (!item) return '';
  if (item.source === 'both') return 'סיכום + חשבון';
  if (item.source === 'bill_only_summary_empty') return 'השלמה מחשבון (שורת סיכום ריקה)';
  if (item.source === 'bill') return 'משוחזר מחשבון';
  return 'קובץ סיכום';
}
