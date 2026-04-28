// Simulate File API for Node, then load parsers via dynamic import
const fs = require('fs');
const path = require('path');

class NodeFile {
  constructor(filepath) {
    this.filepath = filepath;
    this.name = path.basename(filepath);
    this._buf = null;
  }
  async arrayBuffer() {
    if (!this._buf) this._buf = fs.readFileSync(this.filepath);
    return this._buf.buffer.slice(this._buf.byteOffset, this._buf.byteOffset + this._buf.byteLength);
  }
}

(async () => {
  // Need a Vite-resolvable url for pdfjs worker - we'll bypass by setting workerSrc to a no-op fake.
  // Use pdfjs legacy build directly to skip the ?url import resolution.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  // Provide global URL for browser-like context
  globalThis.URL = globalThis.URL || (await import('url')).URL;

  // Patch the worker import in our module by pre-setting workerSrc and stubbing the dynamic import
  const Module = require('module');
  const origResolve = Module._resolveFilename;
  Module._resolveFilename = function (request, ...rest) {
    if (request === 'pdfjs-dist/build/pdf.worker.min.mjs?url') {
      return path.resolve(__dirname, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs');
    }
    return origResolve.call(this, request, ...rest);
  };

  const folder = String.raw`c:\Users\יאיר\Downloads\יאיר אישי\מבחני בית`;

  console.log('\n##### Production Excel #####');
  const { parseProductionExcel } = await import('../src/upload/parsers/productionExcel.js');
  const prod = await parseProductionExcel(new NodeFile(path.join(folder, 'ייצור מערכות סולאריות - מבחן בית.xlsx')));
  console.log('period:', prod?.period);
  console.log('systems:', prod?.totals?.systems_count);
  console.log('total kWh:', prod?.totals?.total_production_kwh);
  console.log('revenue ₪:', prod?.totals?.total_revenue_nis);
  console.log('first system:', prod?.systems[0]);

  console.log('\n##### Summary Excel #####');
  const { parseSummaryExcel } = await import('../src/upload/parsers/summaryExcel.js');
  const sum = await parseSummaryExcel(new NodeFile(path.join(folder, 'סיכום סולארי - מבחן בית.xlsx')));
  console.log('periods:', sum?.periods?.length);
  console.log('totals:', sum?.totals);
  console.log('first 3 periods:');
  sum?.periods.slice(0, 3).forEach(p => console.log(' -', p.range, 'prod:', p.production_kwh, 'profit:', p.net_solar_profit_nis));

  console.log('\n##### Bill PDF 1 #####');
  const url = require('url');
  pdfjs.GlobalWorkerOptions.workerSrc = url.pathToFileURL(
    path.resolve(__dirname, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs')
  ).href;
  // Override the parseElectricityBillPdf module's pdfjs to use legacy
  // We'll inline-implement bill parsing here using the same logic but with legacy build.
  const { parseElectricityBillPdf } = await loadBillParserWithLegacy(pdfjs);
  const bill1 = await parseElectricityBillPdf(new NodeFile(path.join(folder, 'חשבון חשמל 19.09-23.10.pdf')));
  printBill(bill1);

  console.log('\n##### Bill PDF 2 #####');
  const bill2 = await parseElectricityBillPdf(new NodeFile(path.join(folder, 'חשבון חשמל 24.10-19.11.pdf')));
  printBill(bill2);
})().catch(e => { console.error(e); process.exit(1); });

function printBill(b) {
  if (!b) { console.log('NULL'); return; }
  const { sourceFile, parsedAt, ...rest } = b;
  for (const [k, v] of Object.entries(rest)) {
    console.log('  ', k.padEnd(28), '=', JSON.stringify(v));
  }
}

async function loadBillParserWithLegacy(pdfjs) {
  // Load our source and shim the import
  const src = fs.readFileSync(path.resolve(__dirname, '..', 'src/upload/parsers/billPdf.js'), 'utf8');
  const shimmed = src
    .replace("import * as pdfjsLib from 'pdfjs-dist';", '')
    .replace("import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';", '')
    .replace("pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;", '');
  const tmp = path.resolve(__dirname, '_bill-shim.mjs');
  fs.writeFileSync(tmp, "import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';\n" + shimmed);
  const mod = await import('file://' + tmp);
  return mod;
}
