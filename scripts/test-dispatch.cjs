// Full simulation of UploadModal's processFile flow
const fs = require('fs');
const path = require('path');

class NodeFile {
  constructor(filepath) {
    this.filepath = filepath;
    this.name = path.basename(filepath);
  }
  async arrayBuffer() {
    const buf = fs.readFileSync(this.filepath);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }
}

async function main() {
  const url = require('url');
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = url.pathToFileURL(
    path.resolve(__dirname, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs'),
  ).href;

  // Build a node-friendly bill parser by re-writing import
  const billSrc = fs.readFileSync(path.resolve(__dirname, '..', 'src/upload/parsers/billPdf.js'), 'utf8');
  const billShim = path.resolve(__dirname, '_bill-shim.mjs');
  fs.writeFileSync(
    billShim,
    "import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';\n" +
      billSrc
        .replace("import * as pdfjsLib from 'pdfjs-dist';", '')
        .replace("import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';", '')
        .replace("pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;", ''),
  );

  // Build detect.js with node-friendly bill import
  const detectSrc = fs.readFileSync(path.resolve(__dirname, '..', 'src/upload/parsers/detect.js'), 'utf8');
  const detectShim = path.resolve(__dirname, '_detect-shim.mjs');
  fs.writeFileSync(
    detectShim,
    detectSrc
      .replace("from './productionExcel.js';", "from '../src/upload/parsers/productionExcel.js';")
      .replace("from './summaryExcel.js';", "from '../src/upload/parsers/summaryExcel.js';")
      .replace("from './billPdf.js';", "from './_bill-shim.mjs';"),
  );

  const { processFile, KIND, kindLabel } = await import('file://' + detectShim);

  const folder = String.raw`c:\Users\יאיר\Downloads\יאיר אישי\מבחני בית`;
  const files = [
    'ייצור מערכות סולאריות - מבחן בית.xlsx',
    'סיכום סולארי - מבחן בית.xlsx',
    'חשבון חשמל 19.09-23.10.pdf',
    'חשבון חשמל 24.10-19.11.pdf',
  ];

  for (const fname of files) {
    const file = new NodeFile(path.join(folder, fname));
    const { kind, data } = await processFile(file);
    console.log('\n📄', fname);
    console.log('   detected kind:', kind, '(' + kindLabel(kind) + ')');
    if (!data) { console.log('   ⛔ no data extracted'); continue; }
    if (kind === KIND.PRODUCTION) {
      console.log(`   ✓ ${data.totals.systems_count} systems, total production ${data.totals.total_production_kwh} kWh, revenue ₪${data.totals.total_revenue_nis}`);
      console.log(`     Group benchmark: ${data.totals.group_benchmark_kwh_per_kwp} kWh/kWp (median ${data.totals.median_specific_yield_kwh_per_kwp}, σ ${data.totals.std_dev_yield_kwh_per_kwp})`);
      console.log(`     Health: ${data.health.faulty_count} faulty, ${data.health.underperformer_count} underperforming, ${data.health.top_count} top`);
      console.log(`     Lost potential: ${data.health.lost_kwh} kWh ≈ ₪${data.health.lost_revenue_nis}`);
      if (data.health.faulty.length) {
        console.log('     ❌ Faulty systems:');
        data.health.faulty.slice(0, 5).forEach(s => console.log(`       - ${s.name} (${s.capacity_kwp} kWp, ${s.production_kwh} kWh)`));
      }
      console.log('     🏆 Top 3:');
      data.top5.slice(0, 3).forEach(s => console.log(`       - ${s.name}: ${s.specific_yield_kwh_per_kwp} kWh/kWp (${s.deviation_pct > 0 ? '+' : ''}${s.deviation_pct}%)`));
      _state.solar = data;
    } else if (kind === KIND.SUMMARY) {
      console.log(`   ✓ ${data.periods.length} periods, total profit ₪${data.totals.net_solar_profit_nis}`);
      _state.summary = data;
    } else if (kind === KIND.BILL) {
      console.log(`   ✓ Bill ${data.invoiceNumber} | ${data.periodLabel} | ${data.days} days`);
      console.log(`     Customer: ${data.customer} (contract ${data.contractNumber})`);
      console.log(`     Consumption: ${data.consumption_kwh} kWh = ₪${data.consumption_charge_nis}`);
      console.log(`     Total: ₪${data.total_to_pay_nis} (with VAT ₪${data.vat_nis})`);
      if (data.credit_offset_nis) console.log(`     Credit offset: ₪${data.credit_offset_nis}`);
      if (data.net) console.log(`     PV (net): produced ${data.net.production_kwh}, self ${data.net.self_consumption_kwh}, exported ${data.net.export_kwh}`);
      console.log(`     Meters (${data.meters.length}): ${data.meters.map(m => `${m.meterNumber}@×${m.multiplicationFactor}[${m.role}]`).join(', ')}`);
      console.log(`     Regulatory: איזון ₪${data.regulatoryBreakdown.balance_nis}, הולכה ₪${data.regulatoryBreakdown.transmission_nis}, הגנה ₪${data.regulatoryBreakdown.protection_nis}, תעו"ז ₪${data.regulatoryBreakdown.tou_nis}`);
      if (data.recommendation) console.log(`     PV Recommendation: total ₪${data.recommendation.total_nis}, asdara ₪${data.recommendation.asdara_nis}, misc ₪${data.recommendation.misc_nis}`);
      if (data.consumptionAlert) console.log(`     ⚠️  Consumption alert: >30% jump vs same period last year`);
      _state.bills.push(data);
    }
  }

  console.log('\n\n========== UNIFIED PERIODS ==========');
  const unifierSrc = fs.readFileSync(path.resolve(__dirname, '..', 'src/upload/periodUnifier.js'), 'utf8');
  const unifierShim = path.resolve(__dirname, '_unifier.mjs');
  fs.writeFileSync(unifierShim, unifierSrc);
  const { unifyPeriods } = await import('file://' + unifierShim);
  const unified = unifyPeriods({ summary: _state.summary, bills: _state.bills, solar: _state.solar });
  console.log(`Total periods: ${unified.periods.length} (${unified.counts.summary} from summary, ${unified.counts.synthesized} synthesized from bills)`);
  console.log(`Aggregate: production ${unified.totals.production_kwh} kWh, profit ₪${unified.totals.net_solar_profit_nis}, bills ₪${unified.totals.bill_to_pay_nis}, NET ₪${unified.totals.period_net_nis}`);
  console.log('\nPer period:');
  unified.periods.forEach(it => {
    const flag = it.source === 'bill' ? ' (synthesized from bill)' : it.source === 'both' ? ' + bill' : '';
    console.log(`  ${it.period.range}${flag}`);
    console.log(`    production: ${it.kpis.production_kwh} kWh, export: ${it.kpis.export_kwh}, self: ${it.kpis.self_consumption_kwh}`);
    console.log(`    profit: ₪${it.kpis.net_solar_profit_nis}, bill: ${it.kpis.bill_to_pay_nis != null ? '₪'+it.kpis.bill_to_pay_nis : 'n/a'}, period net: ₪${it.kpis.period_net_nis}`);
    if (it.kpis.recommendation_nis != null) console.log(`    PV credit recommendation: ₪${it.kpis.recommendation_nis}`);
  });
}

const _state = { solar: null, summary: null, bills: [] };

main().catch(e => { console.error(e); process.exit(1); });
