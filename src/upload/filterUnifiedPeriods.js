/**
 * @param {ReturnType<import('./periodUnifier.js').unifyPeriods>} unified
 * @param {'all' | Set<string>} selection — Set of period.range keys, or 'all'
 */
const ZERO = {
  production_kwh: 0,
  consumption_kwh: 0,
  export_kwh: 0,
  self_consumption_kwh: 0,
  net_solar_profit_nis: 0,
  bill_to_pay_nis: 0,
  period_net_nis: 0,
};

export function filterUnifiedPeriods(unified, selection) {
  if (!unified?.periods?.length) return unified;
  if (selection === 'all') return unified;
  if (selection.size === 0) {
    return {
      ...unified,
      periods: [],
      totals: { ...ZERO },
      counts: { ...unified.counts, total: 0 },
    };
  }

  const periods = unified.periods.filter((it) => selection.has(it.period.range));
  const totals = periods.reduce(
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
    ...unified,
    periods,
    totals: Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, +v.toFixed(2)])),
    counts: {
      ...unified.counts,
      total: periods.length,
    },
  };
}
