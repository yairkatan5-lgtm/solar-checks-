/* eslint-disable no-console */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, '..', 'public', 'templates', 'solar-summary-template.xlsx');
const buf = fs.readFileSync(file);
const wb = XLSX.read(buf, { type: 'buffer', cellDates: false });
const DATE_RANGE = /^\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s*-\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s*$/;

console.log('File:', file);
console.log('Sheets:', wb.SheetNames);

for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });
  console.log('\n--- Sheet:', name, 'rows:', rows.length);
  let firstData = null;
  for (let i = 0; i < Math.min(rows.length, 80); i++) {
    const r = rows[i];
    const a = r && r[0] != null ? String(r[0]).trim() : '';
    if (DATE_RANGE.test(a)) {
      firstData = i + 1;
      console.log('First DATE_RANGE row (1-based):', firstData, 'A=', a);
      console.log('Sample row cells 1-12:', r.slice(0, 12));
      break;
    }
    if (i < 15) {
      console.log('Row', i + 1, ':', r && r.slice(0, 6));
    }
  }
  if (!firstData) console.log('No DATE_RANGE found in first 80 rows');
}
