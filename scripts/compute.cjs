const fs = require('fs');
const path = require('path');

const dump = JSON.parse(fs.readFileSync(path.join(__dirname, 'raw-dump.json'), 'utf8'));
const rows = dump.Info;
const period = rows[0][0];

const systems = [];
for (let i = 2; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[1]) continue;
  const name = r[1];
  const capacity = parseFloat(r[2]);
  const production = parseFloat(r[3]);
  const tariff = parseFloat(r[4]);
  if (!isFinite(capacity) || !isFinite(production)) continue;
  const id = i - 1;
  const revenue = production * tariff;
  const specificYield = production / capacity;
  systems.push({
    id,
    name,
    capacity_kwp: +capacity.toFixed(2),
    production_kwh: +production.toFixed(2),
    tariff_nis_per_kwh: +tariff.toFixed(4),
    revenue_nis: +revenue.toFixed(2),
    specific_yield_kwh_per_kwp: +specificYield.toFixed(2),
  });
}

// Aggregates
const total_capacity = systems.reduce((s, x) => s + x.capacity_kwp, 0);
const total_production = systems.reduce((s, x) => s + x.production_kwh, 0);
const total_revenue = systems.reduce((s, x) => s + x.revenue_nis, 0);
const avg_yield = total_production / total_capacity;
const weightedTariff = total_revenue / total_production;

// Performance benchmark - typical March in Israel: ~135 kWh/kWp for healthy system
const expected_yield = 135; // kWh/kWp benchmark for March (central Israel)
const underperformers = systems.filter(s => s.specific_yield_kwh_per_kwp < expected_yield * 0.5)
  .map(s => ({ ...s, expected_kwh: +(s.capacity_kwp * expected_yield).toFixed(2), gap_kwh: +(s.capacity_kwp * expected_yield - s.production_kwh).toFixed(2) }));

const ranked = [...systems].sort((a,b) => b.specific_yield_kwh_per_kwp - a.specific_yield_kwh_per_kwp);

// Environmental
// Israel grid emissions factor (Israel Electric Authority recent): ~0.434 kg CO2/kWh
const CO2_KG_PER_KWH = 0.434;
const co2_kg = total_production * CO2_KG_PER_KWH;
const co2_tons = co2_kg / 1000;
// Trees: mature tree absorbs ~21 kg CO2/year (US EPA range ~21-22)
const trees_year = co2_kg / 21;
// Average passenger car: ~4600 kg CO2/year (EPA)
const cars_year = co2_kg / 4600;
// Average car ~120 g CO2/km in Europe -> km equivalent
const km_equivalent = co2_kg / 0.12; // 0.12 kg/km
// Israeli avg household electricity: ~7000 kWh/year => monthly 583 kWh
const households_month = total_production / 583;
// Coal saved (kg) - 1 kWh ~= 0.45 kg coal
const coal_kg_saved = total_production * 0.45;
// Smartphone charges (kWh per charge ~ 0.012)
const phone_charges = total_production / 0.012;

const result = {
  period,
  generated_at: new Date().toISOString(),
  totals: {
    systems_count: systems.length,
    total_capacity_kwp: +total_capacity.toFixed(2),
    total_production_kwh: +total_production.toFixed(2),
    total_revenue_nis: +total_revenue.toFixed(2),
    avg_specific_yield_kwh_per_kwp: +avg_yield.toFixed(2),
    weighted_avg_tariff_nis_per_kwh: +weightedTariff.toFixed(4),
    expected_yield_benchmark: expected_yield,
  },
  environmental: {
    co2_kg_per_kwh: CO2_KG_PER_KWH,
    co2_kg_saved: +co2_kg.toFixed(2),
    co2_tons_saved: +co2_tons.toFixed(2),
    trees_equivalent_year: Math.round(trees_year),
    cars_equivalent_year: +cars_year.toFixed(2),
    km_equivalent: Math.round(km_equivalent),
    households_powered_month: +households_month.toFixed(1),
    coal_kg_saved: Math.round(coal_kg_saved),
    smartphone_charges: Math.round(phone_charges),
  },
  underperformers,
  top5: ranked.slice(0, 5),
  bottom5: ranked.slice(-5).reverse(),
  systems,
};

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'solar-data.json'), JSON.stringify(result, null, 2));
console.log('Wrote src/data/solar-data.json');
console.log('\n--- KEY METRICS ---');
console.log('Period:', period);
console.log('Systems:', systems.length);
console.log('Total Capacity:', total_capacity.toFixed(2), 'kWp');
console.log('Total Production:', total_production.toFixed(2), 'kWh');
console.log('Total Revenue: ₪', total_revenue.toFixed(2));
console.log('Avg Specific Yield:', avg_yield.toFixed(2), 'kWh/kWp');
console.log('Weighted Avg Tariff: ₪', weightedTariff.toFixed(4), '/kWh');
console.log('CO2 Saved:', co2_tons.toFixed(2), 'tons');
console.log('Trees equivalent:', Math.round(trees_year));
console.log('Cars equivalent (year):', cars_year.toFixed(2));
console.log('\nUnderperforming systems:', underperformers.length);
underperformers.forEach(u => console.log(' -', u.name, '|', u.capacity_kwp, 'kWp | yield:', u.specific_yield_kwh_per_kwp, 'kWh/kWp'));
